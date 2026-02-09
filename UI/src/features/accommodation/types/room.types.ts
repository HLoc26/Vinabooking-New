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
