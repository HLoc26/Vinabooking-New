import { NotFoundError } from "@/errors";
import type { PrismaClient } from "@/generated/client";
import AccommodationRepository from "@/repositories/accommodation.repository";
import HolidayRepository from "@/repositories/holiday.repository";
import OwnerRepository from "@/repositories/owner.repository";
import type { DynamicPricingSettings, HolidayOptIn } from "@/types/pricing.types";
import { validateDynamicPricingSettings, validateHolidayOptIns } from "@/utils/pricing-validation";

class OwnerPricingService {
	readonly #prismaClient: PrismaClient;
	readonly #ownerRepository: OwnerRepository;
	readonly #holidayRepository: HolidayRepository;
	readonly #accommodationRepository: AccommodationRepository;

	constructor(
		prismaClient: PrismaClient,
		ownerRepository: OwnerRepository,
		holidayRepository: HolidayRepository,
		accommodationRepository: AccommodationRepository
	) {
		this.#prismaClient = prismaClient;
		this.#ownerRepository = ownerRepository;
		this.#holidayRepository = holidayRepository;
		this.#accommodationRepository = accommodationRepository;
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

		const accommodations = await this.#accommodationRepository.findAllByOwnerId(userId);

		await this.#prismaClient.$transaction(async (tx) => {
			for (const acc of accommodations) {
				// 1. Sync Dynamic Pricing Settings (JSON)
				await this.#accommodationRepository.updatePricingSettings(acc.id, globalSettings);

				// 2. Sync Holiday Opt-ins (Rows)
				const optIns: HolidayOptIn[] = globalHolidays.map((h) => ({
					holidayCode: h.holidayCode,
					priceMultiplier: Number(h.priceMultiplier),
					preDays: h.preDays,
					postDays: h.postDays,
					enabled: h.enabled,
				}));
				await this.#holidayRepository.replaceForAccommodation(acc.id, optIns, tx);
			}
		});

		return { updatedCount: accommodations.length };
	}
}

export default OwnerPricingService;
