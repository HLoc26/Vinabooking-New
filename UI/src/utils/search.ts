import { EAccommodationType } from "../types/Accommodation";
import type { Query, SortOption } from "../types/Query";
import { parseInputDate, toInputDate } from "./dateFormatter";

const DEFAULT_GUESTS = { adults: 2, children: 0, rooms: 1 };
const DEFAULT_PRICE = { min: 0, max: 500 };
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 18;

const getDefaultDates = () => {
	const today = new Date();
	const tomorrow = new Date(today);
	tomorrow.setDate(today.getDate() + 1);

	const dayAfterTomorrow = new Date(tomorrow);
	dayAfterTomorrow.setDate(tomorrow.getDate() + 1);

	return {
		checkIn: tomorrow,
		checkOut: dayAfterTomorrow,
	};
};

export const parseSearchParamsToQuery = (params: URLSearchParams): Query => {
	const defaultDates = getDefaultDates();
	const checkInParam = params.get("checkIn");
	const checkOutParam = params.get("checkOut");

	const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
	const checkIn = checkInParam && dateRegex.test(checkInParam) ? parseInputDate(checkInParam) : defaultDates.checkIn;

	const checkOut = checkOutParam && dateRegex.test(checkOutParam) ? parseInputDate(checkOutParam) : defaultDates.checkOut;

	return {
		keyword: params.get("keyword") || "",

		dates: {
			checkIn: checkIn,
			checkOut: checkOut,
		},

		guests: {
			adults: Number(params.get("adults")) || DEFAULT_GUESTS.adults,
			children: Number(params.get("children")) || DEFAULT_GUESTS.children,
			rooms: Number(params.get("rooms")) || DEFAULT_GUESTS.rooms,
		},

		type: (params.get("type") as EAccommodationType) || null,

		price: {
			min: Number(params.get("minPrice")) || DEFAULT_PRICE.min,
			max: Number(params.get("maxPrice")) || DEFAULT_PRICE.max,
		},

		// Xử lý mảng: ?facilities=wifi,pool -> ['wifi', 'pool']
		facilities: params.get("facilities") ? params.get("facilities")!.split(",").filter(Boolean) : [],

		sortBy: (params.get("sortBy") as SortOption) || "recommended",

		pagination: {
			page: Number(params.get("page")) || DEFAULT_PAGE,
			limit: Number(params.get("limit")) || DEFAULT_LIMIT,
		},
	};
};

export const buildSearchParams = (query: Query): string => {
	const params = new URLSearchParams();

	// 1. Keyword
	if (query.keyword) params.set("keyword", query.keyword);

	// 2. Dates (to ISO string YYYY-MM-DD)
	if (query.dates.checkIn) {
		params.set("checkIn", toInputDate(query.dates.checkIn));
	}
	if (query.dates.checkOut) {
		params.set("checkOut", toInputDate(query.dates.checkOut));
	}

	// 3. Guests
	if (query.guests.adults !== DEFAULT_GUESTS.adults) params.set("adults", query.guests.adults.toString());

	if (query.guests.children !== DEFAULT_GUESTS.children) params.set("children", query.guests.children.toString());

	if (query.guests.rooms !== DEFAULT_GUESTS.rooms) params.set("rooms", query.guests.rooms.toString());

	// 4. Type and Price
	if (query.type && query.type !== EAccommodationType.ALL) {
		params.set("type", query.type);
	}

	if (query.price.min !== DEFAULT_PRICE.min) params.set("minPrice", query.price.min.toString());

	if (query.price.max !== DEFAULT_PRICE.max) params.set("maxPrice", query.price.max.toString());

	// 5. Facilities (joining string into array)
	if (query.facilities.length > 0) {
		params.set("facilities", query.facilities.join(","));
	}

	// 6. Pagination
	if (query.pagination.page > 1) {
		params.set("page", query.pagination.page.toString());
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
