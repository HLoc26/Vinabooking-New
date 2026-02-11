import { EFacilityType, Prisma, type EAccommodationType } from "@/generated/client";
import { ImageFullInfo } from "./image.types";
import { RoomWithDetails } from "./room.types";

export enum ESortOption {
	NEWEST = "newest",
	NAME_ASC = "name_asc",
	NAME_DESC = "name_desc",
	PRICE_ASC = "price_asc",
	PRICE_DESC = "price_desc",
	RECOMMENDED = "recommended",
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

export type AccommodationFullInfo = AccommodationWithDetails & {
	rooms?: RoomWithDetails[];
	images?: ImageFullInfo[];

	// Calculated fields
	thumbnail?: string | null;
	minPrice?: number;
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

/**
 * Represents the final data structure for an item in the search results list.
 */
export type SearchResultItem = AccommodationWithDetails & {
	minPrice: number | null;
	thumbnail: string | null;
};
