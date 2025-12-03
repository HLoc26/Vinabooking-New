import type { StatsResponse } from "../features/home/types/Stats";
import { EAccommodationType } from "../types/Accommodation";
import type { AccommodationSearchData, ApiResponse } from "../types/Response";
import apiClient from "./apiClient";

const accommodationApi = {
	search: (params: { [key: string]: string | number | string[] }) => apiClient.get<ApiResponse<AccommodationSearchData>>("/accommodations/search", { params }).then((r) => r.data),
	stats: () => apiClient.get<StatsResponse>("/accommodations/stats").then((r) => r.data),
	getByType: (type: EAccommodationType | null, page: number, limit: number = 20) =>
		apiClient.get<ApiResponse<AccommodationSearchData>>("/accommodations/search", { params: { type: type, page, limit } }).then((r) => r.data),
};

export default accommodationApi;
