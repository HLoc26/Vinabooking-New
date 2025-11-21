export interface SearchQuery {
	keyword?: string;
	type?: string;
	checkIn?: string;
	checkOut?: string;
	adults?: string;
	children?: string;
	rooms?: string;
	minPrice?: string;
	maxPrice?: string;
	facilities?: string | string[];
	page?: string;
	limit?: string;
	sortBy?: string;
}
