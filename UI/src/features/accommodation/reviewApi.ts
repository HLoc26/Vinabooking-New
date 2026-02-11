import apiClient from "../../services/apiClient";
import type { ApiResponse } from "./types/accommodation.types";
import type { Review } from "./types/review.types";

export const getReviews = (accommodationId: string) => apiClient.get<ApiResponse<Review[]>>(`/reviews/accommodation/${accommodationId}`).then((res) => res.data);
