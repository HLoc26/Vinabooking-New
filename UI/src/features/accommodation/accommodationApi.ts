import apiClient from "../../services/apiClient";
import type { Query } from "../../types/Query";
import type { ApiResponse } from "../../types/Response";
import type { AccommodationDetail, AccommodationSearchData } from "./types/accommodation.types";

export const getAccommodationById = (id: string) => apiClient.get<ApiResponse<AccommodationDetail>>(`/accommodations/${id}`).then((data) => data.data);

export const search = async (query: Partial<Query>): Promise<ApiResponse<AccommodationSearchData> | undefined> => {
	// Map from nested to flat
	const params: {
		[key: string]: string | string[] | undefined;
	} = {
		keyword: query.keyword,
		type: query.type,
		sortBy: query.sortBy,

		// Pagination
		page: query.pagination?.page?.toString(),
		limit: query.pagination?.limit?.toString(),

		// Price
		minPrice: query.price?.min?.toString(),
		maxPrice: query.price?.max?.toString(),

		// Guests
		adults: query.guests?.adults?.toString(),
		children: query.guests?.children?.toString(),
		rooms: query.guests?.rooms?.toString(),

		// Dates
		checkIn: query.dates?.checkIn,
		checkOut: query.dates?.checkOut,

		// Facilities
		facilities: query.facilities,
	};

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const cleanParams = Object.fromEntries(Object.entries(params).filter(([_, v]) => v != null && v !== ""));

	const response = await apiClient.get<ApiResponse<AccommodationSearchData>>("/accommodations/search", {
		params: cleanParams,
	});

	return response.data;
};
