import { ImageDto } from "@/dto/response/image.dto";
import { ViewType, PricingType } from "@/models/room/room.enums";
import type { QuoteItemPricing } from "@/types/pricing.types";

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
