import { Request } from "express";
import type { Prisma } from "@/generated/client";

/* ------------------------------------------------------------------ */
/* Room                                                               */
/* ------------------------------------------------------------------ */

// GET /rooms/:id
export type GetRoomByIdRequest = Request<{
	id: string;
}>;

// GET /accommodations/:accommodationId/rooms
export interface GetRoomsByAccommodationQuery {
	startDate?: string;
	endDate?: string;
}

export type GetRoomsByAccommodationRequest = Request<{ accommodationId: string }, object, object, GetRoomsByAccommodationQuery>;

export type GetRoomsByMultipleIdsRequest = Request<object, object, { accommodationIds: string[] }>;

// POST /rooms
export type CreateRoomRequest = Request<object, object, Prisma.RoomCreateInput>;

// PATCH /rooms/:id
export type UpdateRoomRequest = Request<{ id: string }, object, Prisma.RoomUpdateInput>;

// DELETE /rooms/:id
export type DeleteRoomRequest = Request<{
	id: string;
}>;

/* ------------------------------------------------------------------ */
/* Filtering                                                          */
/* ------------------------------------------------------------------ */

// GET /filter-ids
export interface FilterAccommodationIdsQuery {
	minPrice?: number;
	maxPrice?: number;
	adults?: number;
	children?: number;
	sortBy?: string;
}

export type FilterAccommodationIdsRequest = Request<object, object, object, FilterAccommodationIdsQuery>;

/* ------------------------------------------------------------------ */
/* Bed                                                                */
/* ------------------------------------------------------------------ */

// POST /rooms/:roomId/beds
export type AddBedToRoomRequest = Request<{ roomId: string }, object, Prisma.BedCreateWithoutRoomInput>;

// PATCH /beds/:bedId
export type UpdateBedRequest = Request<{ bedId: string }, object, Prisma.BedUpdateInput>;

// DELETE /beds/:bedId
export type RemoveBedRequest = Request<{
	bedId: string;
}>;

/* ------------------------------------------------------------------ */
/* Amenity                                                            */
/* ------------------------------------------------------------------ */

// POST /rooms/:roomId/amenities
export interface AddAmenityToRoomBody {
	amenityId: string;
	note?: string | null;
}

export type AddAmenityToRoomRequest = Request<{ roomId: string }, object, AddAmenityToRoomBody>;

// DELETE /rooms/:roomId/amenities/:amenityId
export type RemoveAmenityFromRoomRequest = Request<{
	roomId: string;
	amenityId: string;
}>;
