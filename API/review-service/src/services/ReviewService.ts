import UserServiceClient from "../clients/UserServiceClient";
import NotFoundError from "../errors/NotFoundError";
import ReviewRepository from "../repositories/ReviewRepository";
import { GetReviewsResponse } from "../types/Response";
import { AccommodationReview, CreateReplyInput, CreateReviewInput } from "../types/Review";

class ReviewService {
	constructor(
		private reviewRepository: ReviewRepository,
		private userServiceClient: UserServiceClient
	) {}

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

		const accommodationReviews: AccommodationReview[] = await Promise.all(
			reviews
				.filter((r) => r.parentId === null)
				.map(async (r) => ({
					...r,
					children: reviews.filter((reply) => reply.parentId === r.id),
					user: await this.userServiceClient.getUser(r.userId),
				}))
		);

		const res: GetReviewsResponse = accommodationReviews;
		return res;
	}
}

export default ReviewService;
