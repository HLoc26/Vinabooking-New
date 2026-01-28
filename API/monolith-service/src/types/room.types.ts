import { Prisma } from "@generated/client";

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
