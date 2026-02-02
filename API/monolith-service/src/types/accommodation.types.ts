import { Prisma, type EAccommodationType } from "@/generated/client";

export enum ESortOption {
	NEWEST = "newest",
	NAME_ASC = "name_asc",
	NAME_DESC = "name_desc",
	PRICE_ASC = "price_asc",
	PRICE_DESC = "price_desc",
}

export type AccommodationWithDetails = Prisma.AccommodationGetPayload<{
	include: {
		address: true;
		facilities: {
			include: {
				facility: true;
			};
		};
	};
}>;

export interface AccommodationSearchResult {
	data: AccommodationWithDetails[];
	total: number;
}

export interface SearchFilters {
	keyword?: string;
	type?: EAccommodationType;
	ids?: string[];
	facilities?: string[];
}
