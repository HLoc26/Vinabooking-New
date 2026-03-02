import { Prisma } from "@/generated/client";
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
