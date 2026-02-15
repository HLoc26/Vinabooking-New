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
	type: string;
	rentalType: string;
	isActive: boolean;
	address: Address;
	facilities: FacilityConfig[];
	rooms: Room[];
	images: Image[];
}

export type FacilityIconMap = Record<string, ReactNode>;

/* =========================================================================
 * SEARCH
 * ========================================================================= */

export type AccommodationType = "HOTEL" | "APARTMENT" | "RESORT" | "VILLA" | "HOMESTAY" | "HOSTEL" | string;

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
