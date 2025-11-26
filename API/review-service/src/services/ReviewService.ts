import { Review } from "../../generated/prisma/client";
import NotFoundError from "../errors/NotFoundError";
import ReviewRepository from "../repositories/ReviewRepository";
import { GetReviewsResponse } from "../types/Response";
import { AccommodationReview, CreateReplyInput, CreateReviewInput } from "../types/Review";

class ReviewService {
	constructor(private reviewRepository: ReviewRepository) {}

	public async createReview(review: CreateReviewInput, userId: string) {
		return await this.reviewRepository.create(review, userId);
	}

	public async createReply(reply: CreateReplyInput, userId: string) {
		// Check if the parent exists
		const parent = await this.reviewRepository.findParentById(reply.parentId);

		if (!parent) throw new NotFoundError("Parent not found");

		return await this.reviewRepository.create(reply, userId);
	}

	public async getAccommodationReviews(accommodationId: string) {
		const reviews = await this.reviewRepository.findByAccommodationId(accommodationId);

		const accommodationReviews: AccommodationReview[] = reviews.filter((r) => r.parentId === null).map((r) => ({ ...r, children: reviews.filter((reply) => reply.parentId === r.id) }));

		const res: GetReviewsResponse = accommodationReviews;
		return res;
	}
}

export default ReviewService;
