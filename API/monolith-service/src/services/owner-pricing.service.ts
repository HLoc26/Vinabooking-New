import { NotFoundError } from "@/errors";
import { AccommodationRepository, OwnerRepository, RoomRepository } from "@/repositories";
import type { DynamicPricingSettings, HolidayOptIn } from "@/types/pricing.types";
import { validateDynamicPricingSettings, validateHolidayOptIns } from "@/utils/pricing-validation";
import HolidayService from "./holiday.service";

class OwnerPricingService {
	readonly #ownerRepository: OwnerRepository;
	readonly #holidayService: HolidayService;
	readonly #accommodationRepository: AccommodationRepository;
	readonly #roomRepository: RoomRepository;

	constructor(
		ownerRepository: OwnerRepository,
		holidayService: HolidayService,
		accommodationRepository: AccommodationRepository,
		roomRepository: RoomRepository
	) {
		this.#ownerRepository = ownerRepository;
		this.#holidayService = holidayService;
		this.#accommodationRepository = accommodationRepository;
		this.#roomRepository = roomRepository;
	}

	private async resolveOwnerProfile(userId: string) {
		const profile = await this.#ownerRepository.findProfileByUserId(userId);
		if (!profile) throw new NotFoundError("Owner profile not found for user");
		return profile;
	}

	// ----- Owner-wide settings -----

	public async getSettingsByUser(userId: string) {
		const profile = await this.resolveOwnerProfile(userId);
		const settings = profile.getDynamicPricingSettings();
		return { ownerProfileId: profile.getId(), dynamicPricingSettings: settings };
	}

	public async updateSettingsByUser(userId: string, dto: DynamicPricingSettings | null) {
		validateDynamicPricingSettings(dto);
		const profile = await this.resolveOwnerProfile(userId);
		profile.updateDynamicPricingSettings(dto);
		await this.#ownerRepository.saveProfile(profile);
		return { ownerProfileId: profile.getId(), dynamicPricingSettings: profile.getDynamicPricingSettings() };
	}

	// ----- Owner-wide holiday opt-ins -----

	public async getHolidayOptInsByUser(userId: string) {
		const profile = await this.resolveOwnerProfile(userId);
		const holidays = profile.getOwnerHolidays();
		return holidays.map((h) => ({
			id: h.getId(),
			holidayCode: h.getHolidayCode(),
			priceMultiplier: h.getPriceMultiplier(),
			preDays: h.getPreDays(),
			postDays: h.getPostDays(),
			enabled: h.getEnabled(),
		}));
	}

	public async replaceHolidayOptInsByUser(userId: string, items: HolidayOptIn[]) {
		validateHolidayOptIns(items);

		const availableHolidays = await this.#holidayService.getHolidayCatalog();
		const validCodes = new Set(availableHolidays.map(h => h.code));
		for (const item of items) {
			if (!validCodes.has(item.holidayCode)) {
				throw new Error(`Invalid holiday code: ${item.holidayCode}`);
			}
		}

		const profile = await this.resolveOwnerProfile(userId);

		const { OwnerHoliday } = await import("@/models/owner");

		const newHolidays = items.map(item => OwnerHoliday.builder()
			.setOwnerProfileId(profile.getId())
			.setHolidayCode(item.holidayCode)
			.setPriceMultiplier(item.priceMultiplier)
			.setPreDays(item.preDays)
			.setPostDays(item.postDays)
			.setEnabled(item.enabled ?? true)
			.build()
		);

		profile.setOwnerHolidays(newHolidays);
		await this.#ownerRepository.saveOwnerHolidays(profile.getId(), profile.getOwnerHolidays());

		return profile.getOwnerHolidays().map((h) => ({
			id: h.getId(),
			holidayCode: h.getHolidayCode(),
			priceMultiplier: h.getPriceMultiplier(),
			preDays: h.getPreDays(),
			postDays: h.getPostDays(),
			enabled: h.getEnabled(),
		}));
	}

	/**
	 * Force-apply owner-wide settings to all existing accommodations.
	 * IRREVERSIBLE ACTION.
	 */
	public async forceApplyGlobalSettingsToAll(userId: string) {
		const profile = await this.resolveOwnerProfile(userId);
		const globalSettings = profile.getDynamicPricingSettings();
		const globalHolidays = profile.getOwnerHolidays();

		const mappedHolidays = globalHolidays.map((h) => ({
			holidayCode: h.getHolidayCode(),
			priceMultiplier: h.getPriceMultiplier(),
			preDays: h.getPreDays(),
			postDays: h.getPostDays(),
			enabled: h.getEnabled(),
		}));

		return await this.#accommodationRepository.syncAllWithGlobalSettings(userId, globalSettings, mappedHolidays);
	}

	/**
	 * Bulk update floor prices for all rooms in an accommodation using a rule:
	 * floorPrice = max(basePrice * (percent/100), minAmount)
	 */
	public async bulkUpdateRoomFloorPrices(userId: string, accommodationId: string, rule: { percent: number; minAmount: number }) {
		// Security: check ownership
		const isOwner = await this.#accommodationRepository.checkOwnership(accommodationId, userId);
		if (!isOwner) throw new NotFoundError("Accommodation not found or unauthorized");

		return await this.#roomRepository.bulkUpdateFloorPrices(accommodationId, rule);
	}
}

export default OwnerPricingService;
