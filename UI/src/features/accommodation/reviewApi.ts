import apiClient from "../../services/apiClient";
import type { ApiResponse } from "../../types/Response";
import type { Review, ReviewImage } from "./types/review.types";

export const getReviews = (accommodationId: string) => apiClient.get<ApiResponse<Review[]>>(`/reviews/accommodation/${accommodationId}`).then((res) => res.data);
export const getReviewImages = (reviewId: string) => apiClient.get<ApiResponse<ReviewImage[]>>(`/images/REVIEW/${reviewId}`).then((res) => res.data?.data ?? []);
