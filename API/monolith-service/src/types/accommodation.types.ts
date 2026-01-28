import { Prisma, type EAccommodationType } from "@generated/client";

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
