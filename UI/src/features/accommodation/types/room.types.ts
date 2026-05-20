import type { Image } from "../../../types/Image";

export interface Bed {
	id: string;
	name: string;
	description: string | null;
	size: string | null;
	price: number | null;
	bedType: string;
	roomId: string;

	isActive: boolean;
	createdAt: Date;
	updatedAt: Date;
}

export interface Amenity {
	id: string;
	name: string;
	type: string;
	description: string | null;
}
export interface NightBreakdownEntry {
	date: string;
	list: number;
	pay: number;
	holidayMultiplier: number;
	discountRate: number;
	flooredTo: number | null;
}

export interface RoomPricing {
	listPrice: number;
	payablePrice: number;
	averagePricePerNight: number;
	averageListPricePerNight: number;
	discountApplied: boolean;
	holidayApplied: boolean;
	nightBreakdown: NightBreakdownEntry[];
}

export type Room = {
	id: string;
	name: string;
	description: string;
	basePrice: string;
	floorPrice?: string;
	/** @deprecated use basePrice; kept temporarily for components mid-migration. */
	price?: string;
	pricing?: RoomPricing;
	maxAdults: number;
	maxChildren: number;
	size: string;
	bedroomCount: number;
	bathroomCount: number;
	viewType: string;
	beds: Bed[];
	amenities: Amenity[];
	remainingQuantity: number;
	images: Image[];
};
export interface RoomFullDetail extends Room {
	startDate: Date;
	endDate: Date;
	remainingQuantity: number;
	images: Image[];
}
