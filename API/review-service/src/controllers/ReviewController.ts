import { Response } from "express";
import { CreateReviewRequest, GetAccommodationReviewsRequest } from "../types/Request";
import { ApiResponse, CreateReviewResponse, GetReviewsResponse } from "../types/Response";
import { CreateReplyInput, CreateReviewInput } from "../types/Review";
import ReviewService from "../services/ReviewService";
import BookingService from "../services/BookingService";
import ResponseHelper from "../utils/ResponseHelper";
import BadRequestError from "../errors/BadRequestError";
import ForbiddenError from "../errors/ForbiddenError";

class ReviewController {
	constructor(
		private reviewService: ReviewService,
		private bookingService: BookingService
	) {}

	async createReview(req: CreateReviewRequest, res: Response<ApiResponse<CreateReviewResponse>>) {
		const data = req.body;
		const userId = req.user.id;

		// XOR validation
		const hasBooking = Boolean(data.bookingId);
		const hasParent = Boolean(data.parentId);

		// Both true or both false
		if (hasBooking === hasParent) {
			throw new BadRequestError("Invalid request: exactly one of bookingId or parentId must be provided");
		}

		// Handle reply
		if (hasParent) {
			const response = await this.reviewService.createReply(data as CreateReplyInput, userId);
			return ResponseHelper.success(res, response, 201);
		}

		// Handle review
		const isValidBooking = await this.bookingService.verify(data.bookingId!, userId);
		if (!isValidBooking) {
			throw new ForbiddenError("Booking info is not valid for submitting review");
		}

		const response = await this.reviewService.createReview(data as CreateReviewInput, userId);
		return ResponseHelper.success<CreateReviewResponse>(res, response, 201);
	}

	async getAccommodationReviews(req: GetAccommodationReviewsRequest, res: Response<ApiResponse<GetReviewsResponse>>) {
		const accommodationId = req.params.accommodationId;

		const reviews: GetReviewsResponse = await this.reviewService.getAccommodationReviews(accommodationId);

		return ResponseHelper.success<GetReviewsResponse>(res, reviews);
	}
}

export default ReviewController;
