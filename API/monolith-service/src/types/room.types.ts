import { ImageDto } from "@/dto/response/image.dto";
import { ViewType, PricingType, BedType } from "@/models/room/room.enums";

import type { QuoteItemPricing } from "./pricing.types";

export interface RoomFilterOptions {
	minPrice?: number;
	maxPrice?: number;
	adults?: number;
	children?: number;
	sortBy?: string;
}

export interface RoomWithDetails {
	id: string;
	accommodationId: string;
	name: string;
	description: string | null;
	quantity: number;
	maxAdults: number;
	maxChildren: number;
	size: number | null;
	bedroomCount: number;
	bathroomCount: number;
	viewType: ViewType;
	viewDescription: string | null;
	basePrice: any;
	floorPrice: any;
	pricingType: PricingType;
	isActive: boolean;
	createdAt: Date;
	updatedAt: Date;
	beds: any[];
	amenities: any[];
}

export interface AmenityConfigWithDetails {
	id: string;
	roomId: string;
	amenityId: string;
	note: string | null;
	createdAt: Date;
	updatedAt: Date;
	amenity: any;
}

export type RoomFullDetail = RoomWithDetails & {
	remainingQuantity: number;
	images: ImageDto[];
	pricing?: QuoteItemPricing;
};

export interface CreateBedBatchDTO {
	name: string;
	description?: string;
	bedType: BedType;
	quantity?: number;
	size?: string;
	price?: number;
}

export interface CreateRoomDTO {
	name: string;
	description?: string;
	quantity?: number;
	maxAdults?: number;
	maxChildren?: number;
	size?: number;
	bedroomCount?: number;
	bathroomCount?: number;
	viewType?: ViewType;
	viewDescription?: string;
	basePrice?: number;
	floorPrice?: number;
	pricingType?: PricingType;
	isActive?: boolean;

	beds: CreateBedBatchDTO[];
	amenityIds: string[];
}

export type UpdateBedDTO = Partial<CreateBedBatchDTO> & {
	id?: string;
};
export type UpdateRoomDTO = Partial<Omit<CreateRoomDTO, "beds">> & {
	beds?: UpdateBedDTO[];
};
