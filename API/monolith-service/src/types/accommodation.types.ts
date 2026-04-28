import { Prisma, type EAccommodationType, type ERentalType, type EAccommodationStatus } from "@/generated/client";
import { ImageFullInfo } from "./image.types";
import { RoomWithDetails } from "./room.types";

export { EAccommodationStatus } from "@/generated/client";

export enum ESortOption {
	NEWEST = "newest",
	NAME_ASC = "name_asc",
	NAME_DESC = "name_desc",
	PRICE_ASC = "price_asc",
	PRICE_DESC = "price_desc",
	RECOMMENDED = "recommended",
	RATING = "rating",
}

export type AccommodationWithDetails = Prisma.AccommodationGetPayload<{
	include: {
		address: true;
		facilities: {
			include: {
				facility: true;
			};
		};
	};
}>;

export type DraftAccommodation = AccommodationWithDetails & {
	currentWizardStep: number;
};

export type AccommodationFullInfo = AccommodationWithDetails & {
	rooms?: RoomWithDetails[];
	images?: ImageFullInfo[];

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

export interface SearchFilters {
	keyword?: string;
	type?: EAccommodationType;
	ids?: string[];
	facilities?: string[];
}

// --- Search related types ---

/**
 * Query parameters for searching accommodations.
 * It's recommended to validate this object at the controller/entry layer.
 */

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

export interface CreateAccommodationDTO {
	name: string;
	description?: string;
	type: EAccommodationType;
	rentalType: ERentalType;
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
