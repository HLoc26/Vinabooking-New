import { type EAccommodationType } from "@generated/client";

export interface SearchFilters {
	keyword?: string;
	type?: EAccommodationType;
	ids?: string[];
	facilities?: string[];
}
