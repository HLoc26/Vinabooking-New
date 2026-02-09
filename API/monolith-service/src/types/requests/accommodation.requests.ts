import { Request } from "express";
import { type EAccommodationType } from "@/generated/client";
import { ESortOption } from "@/types/accommodation.types";

/**
 * GET /accommodations/:id?checkIn=...&checkOut=...
 */
export interface GetAccommodationByIdParams {
	id: string;
}

// export interface GetAccommodationByIdQuery {
// 	checkIn?: string;
// 	checkOut?: string;
// }

export type GetAccommodationByIdRequest = Request<GetAccommodationByIdParams, object, object>;

/**
 * GET /accommodations?byEntity=room&entityId=...
 */
export interface GetAccommodationByEntityQuery {
	byEntity?: "room";
	entityId?: string;
}

export type GetAccommodationByEntityRequest = Request<object, object, object, GetAccommodationByEntityQuery>;

/**
 * GET /accommodations/count?city=...&type=...
 */
export interface GetAccommodationCountQuery {
	city?: string;
	type?: EAccommodationType;
}

export type GetAccommodationCountRequest = Request<object, object, object, GetAccommodationCountQuery>;

/**
 * GET /accommodations/search
 */
export interface SearchAccommodationQuery {
	keyword?: string;
	city?: string;
	type?: EAccommodationType;
	minPrice?: string;
	maxPrice?: string;
	startDate?: string;
	endDate?: string;
	guests?: string;
	sortBy?: ESortOption;
}

export type SearchAccommodationRequest = Request<object, object, object, SearchAccommodationQuery>;
