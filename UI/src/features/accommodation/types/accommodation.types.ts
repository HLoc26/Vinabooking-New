import type { ReactNode } from "react";

export interface AccommodationImage {
	id: string;
	url: string;
	variant: string;
	imageId: string;
}

export interface AccommodationDetail {
	id: string;
	name: string;
	description: string;
	type: string;
	rentalType: string;
	isActive: boolean;
	address: {
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
	facilities: Array<{
		id: string;
		fee: string;
		note: string | null;
		facility: {
			id: string;
			name: string;
			type: string;
			description: string;
		};
	}>;
	rooms: Array<{
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
		beds: Array<{ id: string; name: string; bedType: string }>;
		amenities: Array<{
			id: string;
			note: string | null;
			amenity: { id: string; name: string; type: string };
		}>;
	}>;
	images: AccommodationImage[];
}

export type FacilityIconMap = Record<string, ReactNode>;
