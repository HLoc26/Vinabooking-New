import type { AccommodationResponse } from "@/modules/accommodation/dto/response/AccommodationResponse";
import type { AccommodationSearchResponse } from "@/modules/accommodation/dto/response/AccommodationSearchResponse";
import type { AccommodationCountResponse } from "@/modules/accommodation/dto/response/AccommodationCountResponse";
import type { HomepageStatsResponse } from "@/modules/accommodation/dto/response/HomepageStatsResponse";
import type { CreateAccommodationRequest } from "@/modules/accommodation/dto/request/CreateAccommodationRequest";
import type { UpdateAccommodationRequest } from "@/modules/accommodation/dto/request/UpdateAccommodationRequest";
import type { UpdateAddressRequest } from "@/modules/accommodation/dto/request/UpdateAddressRequest";
import type { UpdateFacilitiesRequest } from "@/modules/accommodation/dto/request/UpdateFacilitiesRequest";
import type { UpdatePricingSettingsRequest } from "@/modules/accommodation/dto/request/UpdatePricingSettingsRequest";
import type { SearchAccommodationRequest } from "@/modules/accommodation/dto/request/SearchAccommodationRequest";
import type { EAccommodationStatus } from "@/modules/accommodation/enums/EAccommodationStatus";
import type { EAccommodationType } from "@/modules/accommodation/enums/EAccommodationType";

/**
 * Use-case contract for the accommodation module — the public port other modules
 * (notably booking) depend on. Read methods return the aggregated
 * `AccommodationResponse` (base + address + facilities + rooms + images + stats),
 * served through the `acc:detail:` read-through cache. Mutating use-cases return
 * the refreshed detail, mirroring the monolith.
 *
 * CRITICAL: this module does NOT depend on booking. Booking depends on this
 * module and calls `getAccommodationByRoomId` (and `getById`). Live availability
 * / booked counts live in booking, not here, so the module graph stays acyclic.
 */
export interface IAccommodationService {
	/** The full accommodation detail (rooms + images + facilities + stats). Throws 404 if missing. */
	getById(id: string): Promise<AccommodationResponse>;
	/** The accommodation that owns a room — the cross-module entry point booking calls. */
	getAccommodationByRoomId(roomId: string): Promise<AccommodationResponse>;
	/** Batch-fetch many accommodation details (cache-backed); preserves the requested order. */
	getBatch(ids: string[]): Promise<AccommodationResponse[]>;

	/** Paginated search with stats (minPrice/avgStar/reviewCount). */
	search(query: SearchAccommodationRequest): Promise<AccommodationSearchResponse>;
	/** Homepage aggregates: published counts by type and by city. */
	getHomepageStats(): Promise<HomepageStatsResponse>;
	/** Count of published accommodations matching an optional city/type filter. */
	getCount(city?: string, type?: EAccommodationType): Promise<AccommodationCountResponse>;

	/** Create a DRAFT accommodation for the owner; returns its (freshly aggregated) detail. */
	create(ownerId: string, request: CreateAccommodationRequest): Promise<AccommodationResponse>;
	/** Patch basic info (owner-scoped). */
	updateBasicInfo(ownerId: string, id: string, request: UpdateAccommodationRequest): Promise<AccommodationResponse>;
	/** Upsert the 1:1 address (owner-scoped). */
	updateAddress(ownerId: string, id: string, request: UpdateAddressRequest): Promise<AccommodationResponse>;
	/** Replace the facility-config set (owner-scoped). */
	updateFacilities(ownerId: string, id: string, request: UpdateFacilitiesRequest): Promise<AccommodationResponse>;
	/** Set the lifecycle status directly (owner-scoped). */
	updateStatus(ownerId: string, id: string, status: EAccommodationStatus): Promise<AccommodationResponse>;
	/** Set per-accommodation dynamic-pricing + holiday opt-ins (owner-scoped). */
	updatePricingSettings(ownerId: string, id: string, request: UpdatePricingSettingsRequest): Promise<AccommodationResponse>;
	/** Validate readiness (address + ≥1 room with valid price/quantity/beds) and publish (owner-scoped). */
	publish(ownerId: string, id: string): Promise<AccommodationResponse>;
}
