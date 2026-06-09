// Public surface of the room module. Other modules (accommodation, booking) import ONLY from here.

// Module + DI token
export { RoomModule } from "@/modules/room/RoomModule";
export { ROOM_SERVICE } from "@/modules/room/room.tokens";

/**
 * Service contract — the cross-module entry points are:
 *   getRoomById(roomId, window?)                  -> RoomResponse (beds + amenities + images + optional price preview)
 *   getRoomsByMultipleIds(ids)                    -> RoomResponse[]
 *   getRoomsByAccommodationId(accommodationId, window?) -> RoomResponse[]  (accommodation detail aggregation)
 *   createRoom(ownerId, accommodationId, request) -> Room
 *   updateRoom(ownerId, roomId, request)          -> Room
 *   deleteRoom(ownerId, roomId)                   -> void
 *   filterAccommodationIds(filters)               -> string[]  (search support)
 */
export type { IRoomService, PriceWindow } from "@/modules/room/service/IRoomService";

// Domain aggregate + entities (returned by the mutating use-cases)
export { Room } from "@/modules/room/domain/Room";
export { Bed } from "@/modules/room/domain/Bed";
export { Amenity } from "@/modules/room/domain/Amenity";
export { AmenityConfig } from "@/modules/room/domain/AmenityConfig";

// Enums (mirror the Prisma enums)
export { EBedType } from "@/modules/room/enums/EBedType";
export { EViewType } from "@/modules/room/enums/EViewType";
export { EPricingType } from "@/modules/room/enums/EPricingType";
export { EAmenityType } from "@/modules/room/enums/EAmenityType";

// Response DTOs (embedded by the accommodation module's detail response)
export { RoomResponse } from "@/modules/room/dto/response/RoomResponse";
export { BedResponse } from "@/modules/room/dto/response/BedResponse";
export { AmenityResponse } from "@/modules/room/dto/response/AmenityResponse";

// Request DTOs (owner room management)
export { CreateRoomRequest } from "@/modules/room/dto/request/CreateRoomRequest";
export { UpdateRoomRequest } from "@/modules/room/dto/request/UpdateRoomRequest";
export { CreateBedRequest } from "@/modules/room/dto/request/CreateBedRequest";
export { UpdateBedRequest } from "@/modules/room/dto/request/UpdateBedRequest";

// Repository filter options (search support)
export type { RoomFilterOptions } from "@/modules/room/repository/IRoomRepository";
