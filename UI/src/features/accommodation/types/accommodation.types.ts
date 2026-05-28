import type { ReactNode } from "react";
import type { Image } from "../../../types/Image";
import type { Room } from "./room.types";

/* =========================================================================
 * STRICT ENUMS
 * ========================================================================= */

export const ERentalType = {
	ENTIRE_PLACE: "ENTIRE_PLACE",
	PRIVATE_ROOM: "PRIVATE_ROOM",
	SHARED_ROOM: "SHARED_ROOM",
} as const;
export type ERentalType = (typeof ERentalType)[keyof typeof ERentalType];

export const EAccommodationStatus = {
	DRAFT: "DRAFT",
	PUBLISHED: "PUBLISHED",
	HIDDEN: "HIDDEN",
	BANNED: "BANNED",
} as const;
export type EAccommodationStatus = (typeof EAccommodationStatus)[keyof typeof EAccommodationStatus];

export const EFacilityType = {
	GENERAL: "GENERAL",
	FOOD_AND_DRINK: "FOOD_AND_DRINK",
	PUBLIC_FACILITIES: "PUBLIC_FACILITIES",
	SERVICES: "SERVICES",
	SAFETY: "SAFETY",
	ACCESSIBILITY: "ACCESSIBILITY",
	ENTERTAINMENT: "ENTERTAINMENT",
	OUTDOOR: "OUTDOOR",
	TRANSPORTATION: "TRANSPORTATION",
	WELLNESS: "WELLNESS",
	SPECIAL_AMENITIES: "SPECIAL_AMENITIES",
	SUSTAINABILITY: "SUSTAINABILITY",
	OTHER: "OTHER",
} as const;
export type EFacilityType = (typeof EFacilityType)[keyof typeof EFacilityType];

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

export const EAmenityType = {
	COMFORT: "COMFORT",
	ENTERTAINMENT: "ENTERTAINMENT",
	BATHROOM: "BATHROOM",
	KITCHEN: "KITCHEN",
	SAFETY: "SAFETY",
	ACCESSIBILITY: "ACCESSIBILITY",
	WORKSPACE: "WORKSPACE",
	OUTDOOR: "OUTDOOR",
	OTHER: "OTHER",
} as const;

export type EAmenityType = (typeof EAmenityType)[keyof typeof EAmenityType];

export type EAccommodationType = (typeof EAccommodationType)[keyof typeof EAccommodationType];

/* =========================================================================
 * ENTITY INTERFACES
 * ========================================================================= */

export type Address = {
	id: string;
	street: string;
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
	fee: number;
	note: string | null;
	name: string;
	type: EFacilityType;
	description: string;
};

export const EPrepaymentPolicy = {
	PREPAY_100: "PREPAY_100",
	PREPAY_50: "PREPAY_50",
	PREPAY_NONE: "PREPAY_NONE",
} as const;
export type EPrepaymentPolicy = (typeof EPrepaymentPolicy)[keyof typeof EPrepaymentPolicy];

export const ECancellationPolicy = {
	CANCEL_24H: "CANCEL_24H",
	CANCEL_48H: "CANCEL_48H",
	CANCEL_7D: "CANCEL_7D",
	CANCEL_14D: "CANCEL_14D",
	CANCEL_NONE: "CANCEL_NONE",
} as const;
export type ECancellationPolicy = (typeof ECancellationPolicy)[keyof typeof ECancellationPolicy];

export interface AccommodationPolicy {
	checkInTime: string;
	checkOutTime: string;
	prepaymentPolicy: EPrepaymentPolicy;
	cancellationPolicy: ECancellationPolicy;
	cancellationDescription?: string;
	allowsPets?: boolean;
	allowsSmoking?: boolean;
	allowsParties?: boolean;
	quietHoursStart?: string;
	quietHoursEnd?: string;
	additionalRules?: string;
}

/**
 * Main Accommodation infor interface
 */
export interface AccommodationDetail {
	id: string;
	name: string;
	description: string;
	type: EAccommodationType;
	rentalType: ERentalType;
	status: EAccommodationStatus;
	address: Address;
	facilities: FacilityConfig[];
	rooms: Room[];
	images: Image[];
	minPrice: number;
	thumbnail: string; // url
	avgStar: number;
	reviewCount: number;
	policy?: AccommodationPolicy;
}

export type DraftAccommodation = AccommodationDetail & {
	currentWizardStep: number;
};

export type FacilityIconMap = Record<string, ReactNode>;

/* =========================================================================
 * SEARCH
 * ========================================================================= */

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
