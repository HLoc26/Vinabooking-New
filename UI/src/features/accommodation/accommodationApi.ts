import apiClient from "../../services/apiClient";
import type { Query } from "../search/types/Query";
import type { ApiResponse } from "../../types/Response";
import type { AccommodationDetail, AccommodationSearchData, EAccommodationType } from "./types/accommodation.types";
import type { StatsResponse } from "./types/stats.types";

export const getAccommodationById = (id: string) => apiClient.get<ApiResponse<AccommodationDetail>>(`/accommodations/${id}`).then((data) => data.data);

export const getAccommodationsBatch = (ids: string[]) => apiClient.post<ApiResponse<AccommodationDetail[]>>(`/accommodations/_mget`, { ids }).then((data) => data.data);

export const getAccoomodationByRoomId = (roomId: string) => apiClient.get<ApiResponse<AccommodationDetail>>(`/accommodations?byEntity=room&entityId=${roomId}`).then((data) => data.data);

export const getAccommodationByType = (type: EAccommodationType) => search({ type });

export const getStats = () => apiClient.get<ApiResponse<StatsResponse>>("/accommodations/stats").then((data) => data.data);

export const search = async (query: Partial<Query>): Promise<ApiResponse<AccommodationSearchData> | undefined> => {
	// Map from nested to flat
	const params: {
		[key: string]: string | Date | string[] | null | undefined;
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

		// Policy Filters
		allowsPets: query.allowsPets ? "true" : undefined,
		allowsSmoking: query.allowsSmoking ? "true" : undefined,
		allowsParties: query.allowsParties ? "true" : undefined,
		checkInTime: query.checkInTime || undefined,
		checkOutTime: query.checkOutTime || undefined,
		cancellationPolicy: query.cancellationPolicy || undefined,
		prepaymentPolicy: query.prepaymentPolicy || undefined,
		quietHoursStart: query.quietHoursStart || undefined,
	};

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const cleanParams = Object.fromEntries(Object.entries(params).filter(([_, v]) => v != null && v !== ""));

	const response = await apiClient.get<ApiResponse<AccommodationSearchData>>("/accommodations/search", {
		params: cleanParams,
	});

	return response.data;
};
