import type { UpdateOwnerSettingsRequest } from "@/modules/pricing/dto/request/UpdateOwnerSettingsRequest";
import type { HolidayOptInRequest } from "@/modules/pricing/dto/request/HolidayOptInRequest";
import type { BulkUpdateFloorPricesRequest } from "@/modules/pricing/dto/request/BulkUpdateFloorPricesRequest";
import type { Holiday } from "@/modules/pricing/domain/Holiday";
import type { HolidayOptIn } from "@/modules/pricing/domain/HolidayOptIn";
import type { DynamicPricingSettings } from "@/modules/pricing/domain/DynamicPricingSettings";

/** The owner profile id paired with its resolved dynamic-pricing settings. */
export interface OwnerSettings {
	ownerProfileId: string;
	dynamicPricingSettings: DynamicPricingSettings | null;
}

/**
 * Owner-facing pricing administration: holiday catalog, owner-wide dynamic
 * pricing settings, holiday opt-ins, and bulk apply/floor-price actions.
 */
export interface IOwnerPricingService {
	getHolidayCatalog(): Promise<Holiday[]>;

	getSettingsByUser(userId: string): Promise<OwnerSettings>;
	updateSettingsByUser(userId: string, request: UpdateOwnerSettingsRequest | null): Promise<OwnerSettings>;

	getHolidayOptInsByUser(userId: string): Promise<HolidayOptIn[]>;
	replaceHolidayOptInsByUser(userId: string, items: HolidayOptInRequest[]): Promise<HolidayOptIn[]>;

	/** Force-apply owner-wide settings + holidays to every accommodation. Returns rows updated. */
	forceApplyGlobalSettingsToAll(userId: string): Promise<number>;

	/** Bulk-recompute floor prices for an accommodation's rooms. Returns rows updated. */
	bulkUpdateRoomFloorPrices(userId: string, accommodationId: string, rule: BulkUpdateFloorPricesRequest): Promise<number>;
}
