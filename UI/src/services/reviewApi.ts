import apiClient from "./apiClient";
import type { ApiResponse } from "../types/Response";
import type { ReviewData } from "../types/Review";

const reviewApi = {
	create: (data: ReviewData) => apiClient.post<ApiResponse<ReviewData>>("/reviews", data).then((r) => r.data.data),

	getByAccommodation: (accommodationId: string) =>
		apiClient
			.get<ApiResponse<{ reviews: ReviewData[] }>>("/reviews", {
				params: { accommodationId },
			})
			.then((r) => r.data),
};

export default reviewApi;
