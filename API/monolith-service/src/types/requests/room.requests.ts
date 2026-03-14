import { Request } from "express";
import { CreateRoomDTO, UpdateRoomDTO, CreateBedDTO, UpdateBedDTO, AddAmenityDTO } from "@/types/room.types";

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

export type GetRoomsByMultipleIdsRequest = Request<object, object, object, { id?: string }>;

// POST /accommodations/:accommodationId/rooms
export type CreateRoomRequest = Request<{ accommodationId: string }, unknown, CreateRoomDTO>;

// PATCH /rooms/:id
export type UpdateRoomRequest = Request<{ id: string }, unknown, UpdateRoomDTO>;

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
export type AddBedToRoomRequest = Request<{ roomId: string }, unknown, CreateBedDTO>;

// PATCH /beds/:bedId
export type UpdateBedRequest = Request<{ bedId: string }, unknown, UpdateBedDTO>;

// DELETE /beds/:bedId
export type RemoveBedRequest = Request<{
	bedId: string;
}>;

/* ------------------------------------------------------------------ */
/* Amenity                                                            */
/* ------------------------------------------------------------------ */

// POST /rooms/:roomId/amenities
export type AddAmenityToRoomRequest = Request<{ roomId: string }, unknown, AddAmenityDTO>;

// DELETE /rooms/:roomId/amenities/:amenityId
export type RemoveAmenityFromRoomRequest = Request<{
	roomId: string;
	amenityId: string;
}>;
