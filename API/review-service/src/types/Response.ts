import { Review } from "../../generated/prisma/client";

export interface ApiResponse<T> {
	success: boolean;
	data: T | null;
	error: string | null;
}

export type CreateReviewResponse = Review;
