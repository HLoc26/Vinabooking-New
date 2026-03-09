import apiClient from "../../services/apiClient";
import type { Image } from "../../types/Image";
import type { ApiResponse } from "../../types/Response";
import type { Review } from "../review/types/review.types";

export const getReviews = (accommodationId: string) => apiClient.get<ApiResponse<Review[]>>(`/reviews/accommodation/${accommodationId}`).then((res) => res.data);
export const getReviewImages = (reviewId: string) => apiClient.get<ApiResponse<Image[]>>(`/images/REVIEW/${reviewId}`).then((res) => res.data?.data ?? []);
