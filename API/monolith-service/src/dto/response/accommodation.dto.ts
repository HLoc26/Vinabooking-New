import { ImageDto } from "@/dto/response/image.dto";
import { RoomWithDetails } from "@/types/room.types";
import { EAccommodationType, ERentalType, EAccommodationStatus } from "@/generated/client";
export interface FacilityDto {
    id: string;
    name: string;
    type: string;
    description: string | null;
    createdAt: Date;
    updatedAt: Date;
}

export interface FacilityConfigDto {
    id: string;
    accommodationId: string;
    facilityId: string;
    fee: any; 
    note: string | null;
    isAvailable: boolean;
    createdAt: Date;
    updatedAt: Date;
    facility: FacilityDto;
}

export interface AddressDto {
    id: string;
    street: string;
    city: string;
    country: string;
    countryCode: string;
    postalCode: string | null;
    latitude: any; 
    longitude: any;
    fullAddress: string;
    placeId: string | null;
    createdAt: Date;
    updatedAt: Date;
}

export interface AccommodationWithDetails {
    id: string;
    name: string;
    description: string | null;
    type: EAccommodationType;
    rentalType: ERentalType | null;
    status: EAccommodationStatus;
    ownerId: string;
    addressId: string | null;
    dynamicPricingSettings: any | null;
    createdAt: Date;
    updatedAt: Date;
    address: AddressDto | null;
    facilities: FacilityConfigDto[];
}

export type DraftAccommodation = AccommodationWithDetails & {
    currentWizardStep: number;
};

export type AccommodationFullInfo = AccommodationWithDetails & {
    rooms?: RoomWithDetails[];
    images?: ImageDto[];

    // Calculated fields
    thumbnail?: string | null;
    minPrice?: number;
    avgStar?: number | null;
    reviewCount?: number | null;
};

export interface AccommodationSearchResult {
    data: AccommodationFullInfo[];
    total: number;
}

export interface AccommodationStats {
    id: string;
    minPrice: number | null;
    avgStar: number | null;
    reviewCount: number;
}

export interface OwnerAccommodationCard {
    id: string;
    name: string;
    type: EAccommodationType;
    status: EAccommodationStatus;
    thumbnail: string | null;
    address: string | null;
    roomCount: number;
    reviewCount: number;
    avgStar: number | null;
    updatedAt: Date;
}
