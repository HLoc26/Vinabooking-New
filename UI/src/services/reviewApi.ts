import apiClient from "./apiClient";
import type { ApiResponse } from "../types/Response";
import type { ReviewDto } from "../types/Review";

const reviewApi = {
	create: (data: ReviewDto) => apiClient.post<ApiResponse<ReviewDto>>("/reviews", data).then((r) => r.data.data),

	getByAccommodation: (accommodationId: string) =>
		apiClient
			.get<ApiResponse<{ reviews: ReviewDto[] }>>("/reviews", {
				params: { accommodationId },
			})
			.then((r) => r.data),
};

export default reviewApi;
