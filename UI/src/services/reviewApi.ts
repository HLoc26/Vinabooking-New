import apiClient from "./apiClient";
import type { ApiResponse } from "../types/Response";
import type { ReviewData, ReviewDto } from "../types/Review";

const reviewApi = {
	create: (data: ReviewDto) => apiClient.post<ApiResponse<ReviewData>>("/reviews", data).then((r) => r.data.data),

	getByAccommodation: (accommodationId: string) => apiClient.get<ApiResponse<ReviewData[]>>(`/reviews/accommodation/${accommodationId}`).then((r) => r.data.data),

	uploadImages: (type: string, id: string, files: File[]) => {
		const formData = new FormData();

		files.forEach((file) => {
			formData.append("files", file); // MUST match backend array("files", 10)
		});

		return apiClient.post(`/images/${type}/${id}`, formData, {
			headers: {
				"Content-Type": "multipart/form-data",
			},
		});
	},
	getMyReviewByBooking: (bookingId: string) => apiClient.get<ApiResponse<ReviewData>>(`/reviews/booking/${bookingId}/me`).then((r) => r.data.data),
};

export default reviewApi;
