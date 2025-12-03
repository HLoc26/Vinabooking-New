import type { Accommodation, Address, Facility, FacilityConfig, EAccommodationType } from "@prisma/client";

// --- Data Transfer Objects from other services ---

/**
 * Data shape for a room coming from the Room Service.
 */
export interface ServiceRoomDto {
	id: string;
	price: string | number;
	remainingQuantity?: number;
	[key: string]: unknown;
}

/**
 * Data shape for an image coming from the Image Service.
 */
export interface ServiceImageDto {
	id: string;
	url: string;
	variant: "ORIGINAL" | "THUMBNAIL" | "WEBP" | "OPTIMIZED";
	isPrimary?: boolean;
}

// --- Internal Entities and DTOs ---

/**
 * Enriched Accommodation entity used within the service layer.
 * Combines Prisma model with data from other services.
 */

export interface AccommodationEntity extends Accommodation {
	address?: Address | null;
	facilities?: (FacilityConfig & { facility: Facility })[];

	// Data from other services
	rooms?: ServiceRoomDto[];
	images?: ServiceImageDto[];

	// Calculated fields
	thumbnail?: string | null;
	minPrice?: number;
}

// --- Search related types ---

/**
 * Defines the available sorting options for search queries.
 */
export enum SortByOption {
	RECOMMENDED = "recommended",
	PRICE_ASC = "price_asc",
	PRICE_DESC = "price_desc",
}

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
	sortBy?: SortByOption;
}

/**
 * Represents the final data structure for an item in the search results list.
 */
export type SearchResultItem = Omit<AccommodationEntity, "rooms" | "images" | "minPrice" | "thumbnail"> & {
	minPrice: number | null;
	thumbnail: string | null;
};
