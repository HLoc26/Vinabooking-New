import type { EItemType } from "@/modules/pricing/enums/EItemType";
import type { PriceableItem } from "@/modules/pricing/domain/PriceableItem";
import type { Holiday } from "@/modules/pricing/domain/Holiday";
import type { HolidayOptIn } from "@/modules/pricing/domain/HolidayOptIn";
import type { DynamicPricingSettings } from "@/modules/pricing/domain/DynamicPricingSettings";

/** A holiday opt-in to persist (multiplier/window are plain numbers at the boundary). */
export interface HolidayOptInData {
	holidayCode: string;
	priceMultiplier: number;
	preDays: number;
	postDays: number;
	enabled: boolean;
}

/** Rule for a bulk floor-price update across an accommodation's rooms. */
export interface FloorPriceRule {
	percent: number;
	minAmount: number;
}

/**
 * Domain-facing persistence port for pricing. Returns domain models / plain
 * values, never Prisma types. Backed by `PricingDao`.
 */
export interface IPricingRepository {
	// ----- Quote-engine reads -----

	/** Resolve the requested (type,id) line items into priced domain items. */
	findPriceableItems(refs: { itemType: EItemType; itemId: string }[]): Promise<PriceableItem[]>;

	/** Enabled holiday opt-ins for an accommodation (drives the Anchor + Window model). */
	findAccommodationHolidayOptIns(accommodationId: string): Promise<HolidayOptIn[]>;

	/**
	 * Holiday anchors matching the given codes: non-recurring rows within
	 * [from, to] plus every recurring row (matched later by MM-DD).
	 */
	findHolidayAnchors(codes: string[], from: Date, to: Date): Promise<Holiday[]>;

	// ----- Owner-pricing catalog + settings -----

	/** Distinct holiday catalog (one row per code), ordered by date. */
	findHolidayCatalog(): Promise<Holiday[]>;

	/** Resolve the owner profile id for a user, or null if none exists. */
	findOwnerProfileIdByUserId(userId: string): Promise<string | null>;

	getOwnerDynamicPricingSettings(ownerProfileId: string): Promise<DynamicPricingSettings | null>;

	updateOwnerDynamicPricingSettings(ownerProfileId: string, settings: DynamicPricingSettings | null): Promise<DynamicPricingSettings | null>;

	// ----- Owner-wide holiday opt-ins -----

	findOwnerHolidayOptIns(ownerProfileId: string): Promise<HolidayOptIn[]>;

	replaceOwnerHolidayOptIns(ownerProfileId: string, items: HolidayOptInData[]): Promise<HolidayOptIn[]>;

	// ----- Bulk owner actions -----

	/** Force-apply owner-wide settings + holiday opt-ins to all the user's accommodations. */
	syncAllAccommodationsWithGlobalSettings(ownerId: string, settings: DynamicPricingSettings | null, holidays: HolidayOptInData[]): Promise<number>;

	/** Whether `userId` owns the accommodation. */
	isAccommodationOwnedBy(accommodationId: string, userId: string): Promise<boolean>;

	/** Bulk-recompute floor prices for all rooms in an accommodation; returns rows updated. */
	bulkUpdateRoomFloorPrices(accommodationId: string, rule: FloorPriceRule): Promise<number>;
}
