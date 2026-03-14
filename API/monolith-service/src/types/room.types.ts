import { Prisma, type EViewType, type EPricingType, type EBedType } from "@/generated/client";
import { ImageFullInfo } from "./image.types";

export interface RoomFilterOptions {
	minPrice?: number;
	maxPrice?: number;
	adults?: number;
	children?: number;
	sortBy?: string;
}

export type RoomWithDetails = Prisma.RoomGetPayload<{
	include: {
		beds: true;
		amenities: {
			include: { amenity: true };
		};
	};
}>;

export type AmenityConfigWithDetails = Prisma.AmenityConfigGetPayload<{
	include: { amenity: true };
}>;

export type RoomFullDetail = RoomWithDetails & {
	remainingQuantity: number;
	images: ImageFullInfo[];
};

export interface CreateRoomDTO {
	name: string;
	description?: string;
	quantity?: number;
	maxAdults?: number;
	maxChildren?: number;
	size?: number;
	bedroomCount?: number;
	bathroomCount?: number;
	viewType?: EViewType;
	viewDescription?: string;
	price?: number;
	pricingType?: EPricingType;
	isActive?: boolean;
}

export type UpdateRoomDTO = Partial<CreateRoomDTO>;

export interface CreateBedDTO {
	name: string;
	description?: string;
	bedType: EBedType;
	size?: string;
	price?: number;
	isActive?: boolean;
}

export type UpdateBedDTO = Partial<CreateBedDTO>;

export interface AddAmenityDTO {
	amenityId: string;
	note?: string;
}
