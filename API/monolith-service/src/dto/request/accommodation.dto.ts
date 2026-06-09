import { EAccommodationType, ERentalType, EAccommodationStatus } from "@/generated/client";
import type { DynamicPricingSettings, HolidayOptIn } from "@/types/pricing.types";

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
    type?: EAccommodationType;
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
    type: EAccommodationType;
    rentalType: ERentalType;
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
    type?: EAccommodationType;
}

export interface UpdateStatusDTO {
    status: EAccommodationStatus;
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
    type?: EAccommodationType;
    ids?: string[];
    facilities?: string[];
}
