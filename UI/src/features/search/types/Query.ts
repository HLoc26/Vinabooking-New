import type { EAccommodationType } from "../../accommodation/types/accommodation.types";

export type Guests = {
	adults: number;
	children: number;
	rooms: number;
};

export type Dates = {
	checkIn: Date;
	checkOut: Date | null;
};

export type Price = {
	min: number;
	max: number;
};

export type SortOption = "price_asc" | "price_desc" | "newest" | "rating" | "recommended";

export type Pagination = {
	page: number;
	limit: number;
};

export type Query = {
	keyword: string;
	dates: Dates;
	guests: Guests;
	type: EAccommodationType;
	price: Price;
	sortBy: SortOption;
	facilities: string[];
	pagination: Pagination;

	// Policy Filters
	allowsPets?: boolean;
	allowsSmoking?: boolean;
	allowsParties?: boolean;
	checkInTime?: string;
	checkOutTime?: string;
	cancellationPolicy?: string;
	prepaymentPolicy?: string;
	quietHoursStart?: string;
};
