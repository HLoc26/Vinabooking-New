import { Response } from "express";
import { CreateReviewRequest } from "../types/Request";
import { ApiResponse, CreateReviewResponse } from "../types/Response";
import { CreateReplyInput, CreateReviewInput } from "../types/Review";
import ReviewService from "../services/ReviewService";
import BookingService from "../services/BookingService";
import ResponseHelper from "../utils/ResponseHelper";
import BadRequestError from "../errors/BadRequestError";

class ReviewController {
	constructor(
		private reviewService: ReviewService,
		private bookingService: BookingService
	) {}

	async createReview(req: CreateReviewRequest, res: Response<ApiResponse<CreateReviewResponse>>) {
		const reviewData = req.body;
		const userId = req.user.id;
		const isReply = reviewData.parentId ? true : false;

		const bookingId = reviewData.bookingId;
		const parentId = reviewData.parentId;

		let response;

		if (isReply) {
			// Reply review should have a parent
			if (!parentId) {
				throw new BadRequestError("Invalid request: Reply review should include parentId");
			}
			// Reply review should not include bookingId
			if (bookingId) {
				throw new BadRequestError("Invalid request: Reply review should not include bookingId");
			}
			response = await this.reviewService.createReply(reviewData as CreateReplyInput, userId);
		} else {
			// Straight review should include booking ID, reply review does not need
			if (!bookingId) {
				throw new BadRequestError("Invalid request: Review should include bookingId");
			}
			const isValidBooking = await this.bookingService.verify(bookingId, userId);

			// User does not own the booking, or booking state is not COMPLETED
			if (!isValidBooking) {
				throw new BadRequestError("Invalid request: Booking info is not valid for submitting review");
			}
			response = await this.reviewService.createReview(reviewData as CreateReviewInput, userId);
		}

		ResponseHelper.success(res, response, 201);
	}
}

export default ReviewController;
