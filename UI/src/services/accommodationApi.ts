import type { StatsResponse } from "../features/home/types/Stats";
import { EAccommodationType, type Accommodation } from "../types/Accommodation";
import type { ApiResponse, SearchResponse } from "../types/Response";
import apiClient from "./apiClient";

const accommodationApi = {
	search: (params: Record<string, string | number>) => apiClient.get<ApiResponse<{ data: Accommodation[] }>>("/accommodations/search", { params }).then((r) => r.data),
	stats: () => apiClient.get<StatsResponse>("/accommodations/stats").then((r) => r.data),
	getByType: (type: EAccommodationType | null, page: number, limit: number = 20) =>
		apiClient.get<ApiResponse<SearchResponse>>("/accommodations/search", { params: { type: type, page, limit } }).then((r) => r.data),
};

export default accommodationApi;
