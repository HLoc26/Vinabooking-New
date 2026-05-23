import { NotFoundError } from "@/errors";
import AccommodationRepository from "@/repositories/accommodation.repository";
import HolidayRepository from "@/repositories/holiday.repository";
import OwnerRepository from "@/repositories/owner.repository";
import RoomRepository from "@/repositories/room.repository";
import type { DynamicPricingSettings, HolidayOptIn } from "@/types/pricing.types";
import { validateDynamicPricingSettings, validateHolidayOptIns } from "@/utils/pricing-validation";

class OwnerPricingService {
	readonly #ownerRepository: OwnerRepository;
	readonly #holidayRepository: HolidayRepository;
	readonly #accommodationRepository: AccommodationRepository;
	readonly #roomRepository: RoomRepository;

	constructor(
		ownerRepository: OwnerRepository,
		holidayRepository: HolidayRepository,
		accommodationRepository: AccommodationRepository,
		roomRepository: RoomRepository
	) {
		this.#ownerRepository = ownerRepository;
		this.#holidayRepository = holidayRepository;
		this.#accommodationRepository = accommodationRepository;
		this.#roomRepository = roomRepository;
	}

	private async resolveOwnerProfileId(userId: string): Promise<string> {
		const profile = await this.#ownerRepository.findProfileByUserId(userId);
		if (!profile) throw new NotFoundError("Owner profile not found for user");
		return profile.id;
	}

	// ----- Catalog -----

	public async getHolidayCatalog() {
		return await this.#holidayRepository.findAll();
	}

	// ----- Owner-wide settings -----

	public async getSettingsByUser(userId: string) {
		const ownerProfileId = await this.resolveOwnerProfileId(userId);
		const settings = await this.#ownerRepository.getDynamicPricingSettings(ownerProfileId);
		return { ownerProfileId, dynamicPricingSettings: settings };
	}

	public async updateSettingsByUser(userId: string, dto: DynamicPricingSettings | null) {
		validateDynamicPricingSettings(dto);
		const ownerProfileId = await this.resolveOwnerProfileId(userId);
		const updated = await this.#ownerRepository.updateDynamicPricingSettings(ownerProfileId, dto);
		return { ownerProfileId, dynamicPricingSettings: updated.dynamicPricingSettings };
	}

	// ----- Owner-wide holiday opt-ins -----

	public async getHolidayOptInsByUser(userId: string) {
		const ownerProfileId = await this.resolveOwnerProfileId(userId);
		const rows = await this.#holidayRepository.findByOwner(ownerProfileId);
		return rows.map((r) => ({
			id: r.id,
			holidayCode: r.holidayCode,
			priceMultiplier: Number(r.priceMultiplier),
			preDays: r.preDays,
			postDays: r.postDays,
			enabled: r.enabled,
		}));
	}

	public async replaceHolidayOptInsByUser(userId: string, items: HolidayOptIn[]) {
		validateHolidayOptIns(items);
		const ownerProfileId = await this.resolveOwnerProfileId(userId);
		const rows = await this.#holidayRepository.replaceForOwner(ownerProfileId, items);
		return rows.map((r) => ({
			id: r.id,
			holidayCode: r.holidayCode,
			priceMultiplier: Number(r.priceMultiplier),
			preDays: r.preDays,
			postDays: r.postDays,
			enabled: r.enabled,
		}));
	}

	/**
	 * Force-apply owner-wide settings to all existing accommodations.
	 * IRREVERSIBLE ACTION.
	 */
	public async forceApplyGlobalSettingsToAll(userId: string) {
		const ownerProfileId = await this.resolveOwnerProfileId(userId);
		const globalSettings = await this.#ownerRepository.getDynamicPricingSettings(ownerProfileId);
		const globalHolidays = await this.#holidayRepository.findByOwner(ownerProfileId);

		const mappedHolidays = globalHolidays.map((h) => ({
			holidayCode: h.holidayCode,
			priceMultiplier: Number(h.priceMultiplier),
			preDays: h.preDays,
			postDays: h.postDays,
			enabled: h.enabled,
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
