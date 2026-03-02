import type { ReactNode } from "react";
import type { Image } from "../../../types/Image";
import type { Room } from "./room.types";

export type Address = {
	id: string;
	street: string;
	ward: string;
	district: string;
	city: string;
	country: string;
	fullAddress: string;
	latitude: string;
	longitude: string;
	countryCode?: string;
	postalCode?: string;
	placeId?: string;
};

export type FacilityConfig = {
	id: string;
	fee: string;
	note: string | null;
	name: string;
	type: string;
	description: string;
};

/**
 * Main Accommodation infor interface
 */
export interface AccommodationDetail {
	id: string;
	name: string;
	description: string;
	type: EAccommodationType;
	rentalType: string;
	isActive: boolean;
	address: Address;
	facilities: FacilityConfig[];
	rooms: Room[];
	images: Image[];
	minPrice: number;
	thumbnail: string; // url
	avgStar: number;
	reviewCount: number;
}

export type FacilityIconMap = Record<string, ReactNode>;

/* =========================================================================
 * SEARCH
 * ========================================================================= */

export const EAccommodationType = {
	ALL: "ALL",
	HOTEL: "HOTEL",
	APARTMENT: "APARTMENT",
	VILLA: "VILLA",
	VACATION_HOME: "VACATION_HOME",
	GUESTHOUSE: "GUESTHOUSE",
	HOSTEL: "HOSTEL",
	BED_AND_BREAKFAST: "BED_AND_BREAKFAST",
	HOMESTAY: "HOMESTAY",
	CAMPGROUND: "CAMPGROUND",
	COUNTRY_HOUSE: "COUNTRY_HOUSE",
	BOAT: "BOAT",
	LUXURY_TENT: "LUXURY_TENT",
	CABIN: "CABIN",
	MOTEL: "MOTEL",
	RESORT: "RESORT",
	FARMSTAY: "FARMSTAY",
	CAPSULE_HOTEL: "CAPSULE_HOTEL",
	TREEHOUSE: "TREEHOUSE",
	TOWNHOUSE: "TOWNHOUSE",
	OTHER: "OTHER",
} as const;

export type EAccommodationType = (typeof EAccommodationType)[keyof typeof EAccommodationType];

export type SortOption = "price_asc" | "price_desc" | "newest" | "rating" | "recommended";

export interface PaginationMeta {
	page: number;
	limit: number;
	total: number;
	totalPages: number;
}

export interface AccommodationSearchData {
	data: AccommodationDetail[];
	meta: PaginationMeta;
}
