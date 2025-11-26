import type { StatsResponse } from "../features/home/types/Stats";
import type { Accommodation } from "../types/Accommodation";
import type { ApiResponse } from "../types/Response";
import apiClient from "./apiClient";

const accommodationApi = {
	search: (params: Record<string, string | number>) => apiClient.get<ApiResponse<{ data: Accommodation[] }>>("/accommodations/search", { params }).then((r) => r.data),
	stats: () => apiClient.get<StatsResponse>("/accommodations/stats").then((r) => r.data),
};

export default accommodationApi;
