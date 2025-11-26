import NotFoundError from "../errors/NotFoundError";
import ReviewRepository from "../repositories/ReviewRepository";
import { CreateReplyInput, CreateReviewInput } from "../types/Review";

class ReviewService {
	constructor(private reviewRepository: ReviewRepository) {}

	public async createReview(review: CreateReviewInput, userId: string) {
		return await this.reviewRepository.create(review, userId);
	}

	public async createReply(reply: CreateReplyInput, userId: string) {
		// Check if the parent exists
		const parent = this.reviewRepository.findParentById(reply.parentId);

		if (!parent) throw new NotFoundError("Parent not found");

		return await this.reviewRepository.create(reply, userId);
	}
}

export default ReviewService;
