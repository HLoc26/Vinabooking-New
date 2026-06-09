import type { Room } from "@/modules/room/domain/Room";
import type { CreateRoomRequest } from "@/modules/room/dto/request/CreateRoomRequest";
import type { UpdateRoomRequest } from "@/modules/room/dto/request/UpdateRoomRequest";

/** Filter options for the accommodation-id discovery query (price/capacity). */
export interface RoomFilterOptions {
	minPrice?: number;
	maxPrice?: number;
	adults?: number;
	children?: number;
	sortBy?: string;
}

/** Domain-facing persistence port for rooms. Returns domain models, never Prisma types. */
export interface IRoomRepository {
	/** A single room with its beds + amenity configs, or null. */
	findById(roomId: string): Promise<Room | null>;
	/** Many rooms (with beds + amenity configs) by id. */
	findManyByIds(ids: string[]): Promise<Room[]>;
	/** All rooms (with beds + amenity configs) of an accommodation, oldest first. */
	findAllByAccommodationId(accommodationId: string): Promise<Room[]>;
	/** Accommodation ids matching a price/capacity filter, sorted by the rule. */
	findAccommodationIdsByFilter(filters: RoomFilterOptions): Promise<string[]>;
	/** Create a room together with its beds + amenity configs. */
	create(accommodationId: string, data: CreateRoomRequest): Promise<Room>;
	/** Update a room and sync its beds + amenity configs (diff-based). */
	update(roomId: string, data: UpdateRoomRequest): Promise<Room>;
	/** Delete a room (cascades to beds + amenity configs). */
	delete(roomId: string): Promise<void>;

	// --- Ownership checks (IDOR guards) ---
	/** True if the accommodation belongs to the owner (used when creating a room). */
	checkAccommodationOwnership(accommodationId: string, ownerId: string): Promise<boolean>;
	/** True if the room's accommodation belongs to the owner (used when editing/deleting). */
	checkRoomOwnership(roomId: string, ownerId: string): Promise<boolean>;
}
