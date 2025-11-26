import { Review } from "../../generated/prisma/client";
import { AccommodationReview } from "./Review";

export interface ApiResponse<T> {
	success: boolean;
	data: T | null;
	error: string | null;
}

export type CreateReviewResponse = Review;

export type GetReviewsResponse = AccommodationReview[];
