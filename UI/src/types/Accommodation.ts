import type { Image } from "./Image";

export const EAccommodationType = {
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

export interface Accommodation {
	id: string;
	name: string;
	description: string;
	type: EAccommodationType; // or enum AccommodationType
	rentalType: string; // or enum RentalType
	isActive: boolean;
	ownerId: string;
	createdAt: string;
	updatedAt: string;
	addressId: string;
	address: AccommodationAddress;
	facilities: AccommodationFacility[];
	rooms: AccommodationRoom[];
	images: AccommodationImage[];
}

export interface AccommodationAddress {
	id: string;
	street: string;
	ward: string;
	district: string;
	city: string;
	country: string;
	countryCode: string;
	postalCode: string;
	latitude: string;
	longitude: string;
	fullAddress: string;
	placeId: string;
	createdAt: string;
	updatedAt: string;
}

export interface AccommodationFacility {
	id: string;
	fee: string;
	note: string;
	isAvailable: boolean;
	createdAt: string;
	updatedAt: string;
	accommodationId: string;
	facilityId: string;
	facility: Facility;
}

export interface Facility {
	id: string;
	name: string;
	type: string; // enum FacilityType
	description: string;
	createdAt: string;
	updatedAt: string;
}

export interface AccommodationRoom {
	id: string;
	accommodationId: string;
	name: string;
	description: string;
	quantity: number;
	maxAdults: number;
	maxChildren: number;
	size: string;
	bedroomCount: number;
	bathroomCount: number;
	viewType: string; // enum RoomViewType
	viewDescription: string;
	price: string;
	pricingType: string; // enum PricingType
	isActive: boolean;
	createdAt: string;
	updatedAt: string;
	beds: RoomBed[];
	amenities: RoomAmenity[];
	remainingQuantity: number;
}

export interface RoomBed {
	id: string;
}

export interface RoomAmenity {
	id: string;
	note: string;
	createdAt: string;
	updatedAt: string;
	roomId: string;
	amenityId: string;
	amenity: Amenity;
}

export interface Amenity {
	id: string;
	name: string;
	type: string; // enum AmenityType
	description: string;
	createdAt: string;
	updatedAt: string;
}

export type AccommodationImage = Image;
