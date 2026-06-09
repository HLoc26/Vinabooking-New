import type { Room } from "@/modules/room/domain/Room";
import type { RoomResponse } from "@/modules/room/dto/response/RoomResponse";
import type { CreateRoomRequest } from "@/modules/room/dto/request/CreateRoomRequest";
import type { UpdateRoomRequest } from "@/modules/room/dto/request/UpdateRoomRequest";
import type { RoomFilterOptions } from "@/modules/room/repository/IRoomRepository";

/** A stay window for an optional price preview on a room read. */
export interface PriceWindow {
	checkIn: Date;
	checkOut: Date;
}

/**
 * Use-case contract for the room module — the public port other modules
 * (accommodation, booking) depend on.
 *
 * Read methods return enriched `RoomResponse`s (beds + amenities + attached
 * images, plus an optional pricing preview); mutating methods return the `Room`
 * domain aggregate (the REST layer maps it to a `RoomResponse`).
 *
 * NOTE: availability / remaining-quantity (booked-count subtraction) is NOT
 * exposed here — it lives in the booking module, which depends on room.
 */
export interface IRoomService {
	/** A single room (beds + amenities + images), optionally with a price preview. */
	getRoomById(roomId: string, window?: PriceWindow): Promise<RoomResponse>;
	/** Many rooms (beds + amenities + images) by id; throws if none are found. */
	getRoomsByMultipleIds(ids: string[]): Promise<RoomResponse[]>;
	/**
	 * All rooms of an accommodation (beds + amenities + images), optionally with a
	 * batch price preview. Used by the accommodation module's detail aggregation.
	 */
	getRoomsByAccommodationId(accommodationId: string, window?: PriceWindow): Promise<RoomResponse[]>;
	/** Create a room (with beds + amenities) under an accommodation the caller owns. */
	createRoom(ownerId: string, accommodationId: string, request: CreateRoomRequest): Promise<Room>;
	/** Update a room (and sync its beds + amenities); caller must own it. */
	updateRoom(ownerId: string, roomId: string, request: UpdateRoomRequest): Promise<Room>;
	/** Delete a room (and its images); caller must own it. */
	deleteRoom(ownerId: string, roomId: string): Promise<void>;
	/** Accommodation ids matching a price/capacity filter (search support). */
	filterAccommodationIds(filters: RoomFilterOptions): Promise<string[]>;
}
