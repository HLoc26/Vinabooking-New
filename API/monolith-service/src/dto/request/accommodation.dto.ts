import { AccommodationType, RentalType, AccommodationStatus } from "@/models/accommodation/accommodation.enums";
import type { DynamicPricingSettings, HolidayOptIn } from "@/types/pricing.types";

import { Request } from "express";

export enum ESortOption {
    NEWEST = "newest",
    NAME_ASC = "name_asc",
    NAME_DESC = "name_desc",
    PRICE_ASC = "price_asc",
    PRICE_DESC = "price_desc",
    RECOMMENDED = "recommended",
    RATING = "rating",
}

export interface SearchQuery {
    keyword?: string;
    type?: AccommodationType;
    checkIn?: string;
    checkOut?: string;
    adults?: string;
    children?: string;
    rooms?: string;
    minPrice?: string;
    maxPrice?: string;
    facilities?: string | string[];
    page?: string;
    limit?: string;
    sortBy?: ESortOption;
}

export interface CreateAccommodationDTO {
    name: string;
    description?: string;
    type: AccommodationType;
    rentalType: RentalType;
    dynamicPricingSettings?: DynamicPricingSettings | null;
    holidayOptIns?: HolidayOptIn[] | null;
}

export interface UpdateAccommodationPricingDTO {
    dynamicPricingSettings?: DynamicPricingSettings | null;
    holidayOptIns?: HolidayOptIn[] | null;
}

export interface UpdateFacilitiesDTO {
    facilities: {
        facilityId: string;
        fee?: number;
        note?: string;
        isAvailable?: boolean;
    }[];
}

export interface UpdateAccommodationDTO {
    name?: string;
    description?: string;
    type?: AccommodationType;
}

export interface UpdateStatusDTO {
    status: AccommodationStatus;
}

export interface UpdateAddressDTO {
    street: string;
    city: string;
    country: string;
    countryCode: string;
    postalCode?: string;
    latitude?: number;
    longitude?: number;
    fullAddress: string;
    placeId?: string;
}

export interface SearchFilters {
    keyword?: string;
    type?: AccommodationType;
    ids?: string[];
    facilities?: string[];
}

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
