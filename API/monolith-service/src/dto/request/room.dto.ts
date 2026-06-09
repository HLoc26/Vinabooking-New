import { ViewType, PricingType, BedType } from "@/models/room/room.enums";

import { Request } from "express";

export interface RoomFilterOptions {
	minPrice?: number;
	maxPrice?: number;
	adults?: number;
	children?: number;
	sortBy?: string;
}

export interface CreateBedBatchDTO {
	name: string;
	description?: string;
	bedType: BedType;
	quantity?: number;
	size?: string;
	price?: number;
}

export interface CreateRoomDTO {
	name: string;
	description?: string;
	quantity?: number;
	maxAdults?: number;
	maxChildren?: number;
	size?: number;
	bedroomCount?: number;
	bathroomCount?: number;
	viewType?: ViewType;
	viewDescription?: string;
	basePrice?: number;
	floorPrice?: number;
	pricingType?: PricingType;
	isActive?: boolean;

	beds: CreateBedBatchDTO[];
	amenityIds: string[];
}

export type UpdateBedDTO = Partial<CreateBedBatchDTO> & {
	id?: string;
};

export type UpdateRoomDTO = Partial<Omit<CreateRoomDTO, "beds">> & {
	beds?: UpdateBedDTO[];
};

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
