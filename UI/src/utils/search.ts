import { EAccommodationType } from "../types/Accommodation";
import type { Query } from "../types/Query";
import { toInputDate } from "./dateFormatter";

export const buildSearchParams = (criteria: Query) => {
	const params = new URLSearchParams();

	const simpleMappings: Record<string, string | number> = {
		keyword: criteria.keyword,
		type: criteria.type,
		minPrice: criteria.price.min,
		maxPrice: criteria.price.max,
		sortBy: criteria.sortBy,
		page: criteria.pagination.page,
		limit: criteria.pagination.limit,
		adults: criteria.guests.adults,
		children: criteria.guests.children,
		rooms: criteria.guests.rooms,
	};

	Object.entries(simpleMappings).forEach(([key, value]) => {
		if (value !== undefined && value !== null && value !== "") {
			params.set(key, String(value));
		}
	});

	// dates
	params.set("checkIn", toInputDate(criteria.dates.checkIn));
	if (criteria.dates.checkOut) {
		params.set("checkOut", toInputDate(criteria.dates.checkOut ?? ""));
	}

	// facilities (array)
	if (criteria.facilities.length > 0) {
		params.set("facilities", criteria.facilities.join(","));
	}

	return params.toString();
};

export function parseEAccommodationType(value: string | null): EAccommodationType {
	if (!value) return EAccommodationType.ALL;

	// check if value in Enum
	if (Object.values(EAccommodationType).includes(value as EAccommodationType)) {
		return value as EAccommodationType;
	}

	return EAccommodationType.ALL;
}
