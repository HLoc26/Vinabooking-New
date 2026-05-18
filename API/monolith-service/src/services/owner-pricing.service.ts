import { NotFoundError } from "@/errors";
import HolidayRepository from "@/repositories/holiday.repository";
import OwnerRepository from "@/repositories/owner.repository";
import type { DynamicPricingSettings, HolidayOptIn } from "@/types/pricing.types";
import { validateDynamicPricingSettings, validateHolidayOptIns } from "@/utils/pricing-validation";

class OwnerPricingService {
	readonly #ownerRepository: OwnerRepository;
	readonly #holidayRepository: HolidayRepository;

	constructor(ownerRepository: OwnerRepository, holidayRepository: HolidayRepository) {
		this.#ownerRepository = ownerRepository;
		this.#holidayRepository = holidayRepository;
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
			holidayId: r.holidayId,
			priceMultiplier: Number(r.priceMultiplier),
			enabled: r.enabled,
			holiday: r.holiday,
		}));
	}

	public async replaceHolidayOptInsByUser(userId: string, items: HolidayOptIn[]) {
		validateHolidayOptIns(items);
		const ownerProfileId = await this.resolveOwnerProfileId(userId);
		const rows = await this.#holidayRepository.replaceForOwner(ownerProfileId, items);
		return rows.map((r) => ({
			id: r.id,
			holidayId: r.holidayId,
			priceMultiplier: Number(r.priceMultiplier),
			enabled: r.enabled,
			holiday: r.holiday,
		}));
	}
}

export default OwnerPricingService;
