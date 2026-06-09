import { inject, injectable } from "tsyringe";
import type { IOwnerPricingService, OwnerSettings } from "@/modules/pricing/service/IOwnerPricingService";
import { PRICING_REPOSITORY } from "@/modules/pricing/pricing.tokens";
import type { HolidayOptInData, IPricingRepository } from "@/modules/pricing/repository/IPricingRepository";
import type { Holiday } from "@/modules/pricing/domain/Holiday";
import type { HolidayOptIn } from "@/modules/pricing/domain/HolidayOptIn";
import type { DynamicPricingSettings } from "@/modules/pricing/domain/DynamicPricingSettings";
import type { UpdateOwnerSettingsRequest } from "@/modules/pricing/dto/request/UpdateOwnerSettingsRequest";
import type { HolidayOptInRequest } from "@/modules/pricing/dto/request/HolidayOptInRequest";
import type { BulkUpdateFloorPricesRequest } from "@/modules/pricing/dto/request/BulkUpdateFloorPricesRequest";
import { NotFoundError } from "@/shared/error/NotFoundError";
import { BadRequestError } from "@/shared/error/BadRequestError";

/**
 * Owner-facing pricing administration. Ports the monolith
 * `OwnerPricingService`: resolves the caller's owner profile (404 for
 * non-owners — equivalent to the monolith's role guard), then reads/writes
 * owner-wide settings, holiday opt-ins, and bulk apply/floor-price actions.
 */
@injectable()
export class OwnerPricingServiceImpl implements IOwnerPricingService {
	constructor(@inject(PRICING_REPOSITORY) private readonly repository: IPricingRepository) {}

	public async getHolidayCatalog(): Promise<Holiday[]> {
		return this.repository.findHolidayCatalog();
	}

	public async getSettingsByUser(userId: string): Promise<OwnerSettings> {
		const ownerProfileId = await this.resolveOwnerProfileId(userId);
		const dynamicPricingSettings = await this.repository.getOwnerDynamicPricingSettings(ownerProfileId);
		return { ownerProfileId, dynamicPricingSettings };
	}

	public async updateSettingsByUser(userId: string, request: UpdateOwnerSettingsRequest | null): Promise<OwnerSettings> {
		const settings: DynamicPricingSettings | null = request ?? null;
		const ownerProfileId = await this.resolveOwnerProfileId(userId);
		const dynamicPricingSettings = await this.repository.updateOwnerDynamicPricingSettings(ownerProfileId, settings);
		return { ownerProfileId, dynamicPricingSettings };
	}

	public async getHolidayOptInsByUser(userId: string): Promise<HolidayOptIn[]> {
		const ownerProfileId = await this.resolveOwnerProfileId(userId);
		return this.repository.findOwnerHolidayOptIns(ownerProfileId);
	}

	public async replaceHolidayOptInsByUser(userId: string, items: HolidayOptInRequest[]): Promise<HolidayOptIn[]> {
		this.assertNoDuplicateCodes(items);
		const ownerProfileId = await this.resolveOwnerProfileId(userId);
		return this.repository.replaceOwnerHolidayOptIns(ownerProfileId, items.map((i) => this.toOptInData(i)));
	}

	public async forceApplyGlobalSettingsToAll(userId: string): Promise<number> {
		const ownerProfileId = await this.resolveOwnerProfileId(userId);
		const settings = await this.repository.getOwnerDynamicPricingSettings(ownerProfileId);
		const holidays = await this.repository.findOwnerHolidayOptIns(ownerProfileId);
		const mapped: HolidayOptInData[] = holidays.map((h) => ({
			holidayCode: h.holidayCode,
			priceMultiplier: h.priceMultiplier.toNumber(2),
			preDays: h.preDays,
			postDays: h.postDays,
			enabled: h.enabled,
		}));
		return this.repository.syncAllAccommodationsWithGlobalSettings(userId, settings, mapped);
	}

	public async bulkUpdateRoomFloorPrices(userId: string, accommodationId: string, rule: BulkUpdateFloorPricesRequest): Promise<number> {
		const isOwner = await this.repository.isAccommodationOwnedBy(accommodationId, userId);
		if (!isOwner) throw new NotFoundError("Accommodation not found or unauthorized");
		return this.repository.bulkUpdateRoomFloorPrices(accommodationId, { percent: rule.percent, minAmount: rule.minAmount });
	}

	private async resolveOwnerProfileId(userId: string): Promise<string> {
		const ownerProfileId = await this.repository.findOwnerProfileIdByUserId(userId);
		if (!ownerProfileId) throw new NotFoundError("Owner profile not found for user");
		return ownerProfileId;
	}

	private assertNoDuplicateCodes(items: HolidayOptInRequest[]): void {
		const seen = new Set<string>();
		for (const item of items) {
			if (seen.has(item.holidayCode)) {
				throw new BadRequestError(`Duplicate holidayCode in opt-in list: ${item.holidayCode}`);
			}
			seen.add(item.holidayCode);
		}
	}

	private toOptInData(item: HolidayOptInRequest): HolidayOptInData {
		return {
			holidayCode: item.holidayCode,
			priceMultiplier: item.priceMultiplier,
			preDays: item.preDays,
			postDays: item.postDays,
			enabled: item.enabled ?? true,
		};
	}
}
