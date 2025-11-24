import type { ReactNode } from "react";

/**
 * @deprecated use ImageType from src/types/Imgae instead
 */
export interface AccommodationImage {
	id: string;
	url: string;
	variant: string;
	imageId: string;
}

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
};

export type FacilityConfig = {
	id: string;
	fee: string;
	note: string | null;
	facility: Facility;
};

export type Facility = {
	id: string;
	name: string;
	type: string;
	description: string;
};

export type Room = {
	id: string;
	name: string;
	description: string;
	price: string;
	maxAdults: number;
	maxChildren: number;
	size: string;
	bedroomCount: number;
	bathroomCount: number;
	viewType: string;
	beds: Bed[];
	amenities: AmenityConfig[];
};

export type Bed = { id: string; name: string; bedType: string };

export type AmenityConfig = {
	id: string;
	note: string | null;
	amenity: Amenity;
};

export type Amenity = { id: string; name: string; type: string };

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
	images: AccommodationImage[];
}

export type FacilityIconMap = Record<string, ReactNode>;
