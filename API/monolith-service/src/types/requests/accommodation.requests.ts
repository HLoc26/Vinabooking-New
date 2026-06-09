import { Request } from "express";
import { AccommodationType } from "@/models/accommodation/accommodation.enums";
import { SearchQuery, CreateAccommodationDTO, UpdateFacilitiesDTO, UpdateAccommodationDTO, UpdateStatusDTO, UpdateAddressDTO } from "@/dto/request/accommodation.dto";

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
 * POST /accommodations
 */

export interface PostAccommodationIdsBody {
	ids: string[];
}

export type PostAccommodationIdsRequest = Request<object, PostAccommodationIdsBody>;

/**
 * GET /accommodations/count?city=...&type=...
 */
export interface GetAccommodationCountQuery {
	city?: string;
	type?: AccommodationType;
}

export type GetAccommodationCountRequest = Request<object, object, object, GetAccommodationCountQuery>;

export type SearchAccommodationRequest = Request<object, object, object, SearchQuery>;

// Create Accommodation
export type CreateAccommodationRequest = Request<object, unknown, CreateAccommodationDTO>;
export type UpdateFacilitiesRequest = Request<{ id: string }, unknown, UpdateFacilitiesDTO>;

// Update Accommodation
export type UpdateAccommodationRequest = Request<{ id: string }, unknown, UpdateAccommodationDTO>;
export type UpdateStatusRequest = Request<{ id: string }, unknown, UpdateStatusDTO>;
export type UpdateAddressRequest = Request<{ id: string }, unknown, UpdateAddressDTO>;
