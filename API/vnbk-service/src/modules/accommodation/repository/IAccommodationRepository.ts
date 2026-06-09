import type { Accommodation } from "@/modules/accommodation/domain/Accommodation";
import type { EAccommodationType } from "@/modules/accommodation/enums/EAccommodationType";
import type { ERentalType } from "@/modules/accommodation/enums/ERentalType";
import type { EAccommodationStatus } from "@/modules/accommodation/enums/EAccommodationStatus";
import type { ESortOption } from "@/modules/accommodation/enums/ESortOption";
import type { DynamicPricingSettings } from "@/modules/accommodation/domain/DynamicPricingSettings";

/** Filters applied to the stats / search raw query. */
export interface SearchFilters {
	keyword?: string;
	type?: EAccommodationType;
	ids?: string[];
	facilities?: string[];
}

/** One stats row from the raw SQL (minPrice over rooms+beds, avgStar/reviewCount over reviews). */
export interface AccommodationStatsRow {
	id: string;
	minPrice: number | null;
	avgStar: number | null;
	reviewCount: number;
}

/** Result of the paginated stats query: the rows plus the total match count. */
export interface StatsResult {
	statsRows: AccommodationStatsRow[];
	total: number;
}

/** A holiday opt-in to persist alongside an accommodation (on create/update). */
export interface HolidayOptInData {
	holidayCode: string;
	priceMultiplier: number;
	preDays: number;
	postDays: number;
	enabled: boolean;
}

/** How holiday opt-ins should be resolved on create. */
export type HolidayMode = "inherit" | "none" | "explicit";

/** Everything needed to create an accommodation (DRAFT) in one transaction. */
export interface CreateAccommodationData {
	ownerId: string;
	name: string;
	description: string | null;
	type: EAccommodationType;
	/** Optional on the model (defaults to ENTIRE_PLACE). */
	rentalType?: ERentalType;
	dynamicPricingSettings: DynamicPricingSettings | null;
	holidayMode: HolidayMode;
	/** Used when holidayMode === "explicit"; ignored otherwise. */
	holidayOptIns: HolidayOptInData[];
}

/** Basic-info patch (name/description/type). */
export interface UpdateBasicInfoData {
	name?: string;
	description?: string;
	type?: EAccommodationType;
}

/** Full address upsert payload. */
export interface UpdateAddressData {
	street: string;
	city: string;
	country: string;
	countryCode: string;
	postalCode?: string;
	latitude?: number;
	longitude?: number;
	fullAddress: string;
	placeId?: string;
}

/** A facility-config entry to (re)create when syncing facilities. */
export interface FacilityConfigData {
	facilityId: string;
	fee?: number;
	note?: string;
	isAvailable?: boolean;
}

/** A room's publish-readiness snapshot (read raw; rooms are owned by the room module). */
export interface PublishRoomSnapshot {
	name: string;
	basePrice: number;
	floorPrice: number;
	quantity: number;
	bedCount: number;
}

/** The data needed to validate a publish, loaded raw (address presence + rooms). */
export interface PublishSnapshot {
	id: string;
	status: EAccommodationStatus;
	hasAddress: boolean;
	rooms: PublishRoomSnapshot[];
}

/**
 * Domain-facing persistence port for accommodations. Returns domain models /
 * plain value objects, never Prisma types. The raw stats/search SQL is fully
 * encapsulated in the DAO behind `getStatsRows`.
 */
export interface IAccommodationRepository {
	/** A single accommodation (address + facility configs), or null. */
	findById(id: string): Promise<Accommodation | null>;
	/** Many accommodations (address + facility configs) by id (preserves no order). */
	findByIdBatch(ids: string[]): Promise<Accommodation[]>;
	/** The owning accommodation id for a room, or null. */
	findAccommodationIdByRoomId(roomId: string): Promise<string | null>;

	/** Create a DRAFT accommodation (+ holiday opt-ins) in one transaction; returns the new id. */
	create(data: CreateAccommodationData): Promise<string>;

	/** Patch basic info (name/description/type). */
	updateBasicInfo(id: string, data: UpdateBasicInfoData): Promise<void>;
	/** Upsert the 1:1 address. */
	updateAddress(id: string, data: UpdateAddressData): Promise<void>;
	/** Replace the full facility-config set (delete + recreate). */
	syncFacilities(id: string, facilities: FacilityConfigData[]): Promise<void>;
	/** Set the lifecycle status. */
	updateStatus(id: string, status: EAccommodationStatus): Promise<void>;
	/** Set per-accommodation dynamic-pricing settings (null clears them). */
	updatePricingSettings(id: string, settings: DynamicPricingSettings | null): Promise<void>;
	/** Replace per-accommodation holiday opt-ins (empty array clears them). */
	replaceHolidayOptIns(id: string, items: HolidayOptInData[]): Promise<void>;

	/** Load the raw publish-validation snapshot (scoped to the owner), or null. */
	getPublishSnapshot(id: string, ownerId: string): Promise<PublishSnapshot | null>;

	/** Paginated stats rows (minPrice/avgStar/reviewCount) for a filter; encapsulates raw SQL. */
	getStatsRows(filters: SearchFilters, offset: number, limit: number, sortBy?: ESortOption): Promise<StatsResult>;

	/** Count of published accommodations matching an optional city/type filter. */
	count(filters: { city?: string; type?: EAccommodationType }): Promise<number>;
	/** Published-accommodation counts grouped by type (desc). */
	countByType(): Promise<{ type: EAccommodationType; count: number }[]>;
	/** Published-accommodation counts grouped by city (desc, top 20). */
	countByCity(): Promise<{ city: string; count: number }[]>;

	/** Inherited owner-level dynamic-pricing defaults for a user, or null. */
	findOwnerDefaultSettings(userId: string): Promise<DynamicPricingSettings | null>;
	/** Snapshot the owner's holiday opt-ins (for the create "inherit" path). */
	findOwnerHolidayOptIns(userId: string): Promise<HolidayOptInData[]>;

	/** True if the accommodation belongs to the owner (IDOR guard). */
	checkOwnership(id: string, ownerId: string): Promise<boolean>;
}
