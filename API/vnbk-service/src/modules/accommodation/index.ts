// Public surface of the accommodation module. Other modules (notably booking) import ONLY from here.

// Module + DI token
export { AccommodationModule } from "@/modules/accommodation/AccommodationModule";
export { ACCOMMODATION_SERVICE } from "@/modules/accommodation/accommodation.tokens";

/**
 * Service contract — the cross-module entry points booking depends on are:
 *   getById(id)                       -> AccommodationResponse (base + address + facilities + rooms + images + stats)
 *   getAccommodationByRoomId(roomId)  -> AccommodationResponse (resolve the owning accommodation of a room)
 *   getBatch(ids)                     -> AccommodationResponse[]
 *
 * CRITICAL: this module does NOT depend on booking; booking depends on it. Live
 * availability / booked counts live in booking to keep the module graph acyclic.
 */
export type { IAccommodationService } from "@/modules/accommodation/service/IAccommodationService";

// Enums (mirror the Prisma enums; ESortOption is TS-only)
export { EAccommodationType } from "@/modules/accommodation/enums/EAccommodationType";
export { ERentalType } from "@/modules/accommodation/enums/ERentalType";
export { EAccommodationStatus } from "@/modules/accommodation/enums/EAccommodationStatus";
export { EFacilityType } from "@/modules/accommodation/enums/EFacilityType";
export { ESortOption } from "@/modules/accommodation/enums/ESortOption";

// Response DTOs (the public detail shape + its parts; booking embeds these)
export { AccommodationResponse } from "@/modules/accommodation/dto/response/AccommodationResponse";
export { AddressResponse } from "@/modules/accommodation/dto/response/AddressResponse";
export { FacilityConfigResponse } from "@/modules/accommodation/dto/response/FacilityConfigResponse";
export { AccommodationSearchResponse, SearchMeta } from "@/modules/accommodation/dto/response/AccommodationSearchResponse";
export { AccommodationCountResponse } from "@/modules/accommodation/dto/response/AccommodationCountResponse";
export { HomepageStatsResponse } from "@/modules/accommodation/dto/response/HomepageStatsResponse";
