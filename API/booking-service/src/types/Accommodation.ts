// types/AccommodationPayload.ts
export enum EAccommodationType {
	HOTEL = "HOTEL",
	APARTMENT = "APARTMENT",
	VILLA = "VILLA",
	VACATION_HOME = "VACATION_HOME",
	GUESTHOUSE = "GUESTHOUSE",
	HOSTEL = "HOSTEL",
	BED_AND_BREAKFAST = "BED_AND_BREAKFAST",
	HOMESTAY = "HOMESTAY",
	CAMPGROUND = "CAMPGROUND",
	COUNTRYHOUSE = "COUNTRYHOUSE",
	BOAT = "BOAT",
	LUXURY_TENT = "LUXURY_TENT",
	CABIN = "CABIN",
	MOTEL = "MOTEL",
	RESORT = "RESORT",
	FARMSTAY = "FARMSTAY",
	CAPSULE_HOTEL = "CAPSULE_HOTEL",
	TREEHOUSE = "TREEHOUSE",
	TOWNHOUSE = "TOWNHOUSE",
	OTHER = "OTHER",
}

export enum ERentalType {
	ENTIRE_PLACE = "ENTIRE_PLACE",
	PRIVATE_ROOM = "PRIVATE_ROOM",
	SHARED_ROOM = "SHARED_ROOM",
}

export enum EFacilityType {
	GENERAL = "GENERAL",
	FOOD_AND_DRINK = "FOOD_AND_DRINK",
	PUBLIC_FACILITIES = "PUBLIC_FACILITIES",
	SERVICES = "SERVICES",
	SAFETY = "SAFETY",
	ACCESSIBILITY = "ACCESSIBILITY",
	ENTERTAINMENT = "ENTERTAINMENT",
	OUTDOOR = "OUTDOOR",
	TRANSPORTATION = "TRANSPORTATION",
	WELLNESS = "WELLNESS",
	SPECIAL_AMENITIES = "SPECIAL_AMENITIES",
	SUSTAINABILITY = "SUSTAINABILITY",
	OTHER = "OTHER",
}
// types/Accommodation.ts
export type ImageVariant = "ORIGINAL" | "THUMBNAIL" | "WEBP" | "OPTIMIZED";

export interface AccommodationImage {
	id: string;
	url: string;
	variant: ImageVariant;
	imageId: string;
}

export interface AccommodationData {
	id: string;
	name: string;
	description?: string;
	// ... other existing fields ...
	images?: AccommodationImage[];
	// If your API wraps with { success, data, error } you'll keep that wrapper type below
}

export interface AccommodationPayload {
	success: boolean;
	data: AccommodationData;
	error?: any;
}

export interface AddressPayload {
	id: string;
	street: string;
	ward?: string;
	district?: string;
	city: string;
	country: string;
	countryCode: string;
	postalCode?: string;
	latitude?: number;
	longitude?: number;
	fullAddress: string;
	placeId?: string;
	createdAt?: string;
	updatedAt?: string;
}

export interface FacilityPayload {
	id: string;
	name: string;
	type: EFacilityType; // EFacilityType
	description?: string;
	createdAt?: string;
	updatedAt?: string;
}

export interface FacilityConfigPayload {
	id: string;
	fee?: number;
	note?: string;
	isAvailable: boolean;
	accommodationId: string;
	facilityId: string;
	createdAt?: string;
	updatedAt?: string;
}
