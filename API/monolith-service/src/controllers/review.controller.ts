import { Response } from "express";
import ResponseHelper from "@/utils/response";
import { ReviewService } from "@/services";
import BadRequestError from "@/errors/BadRequestError";
import { CreateReviewRequest, GetAccommodationReviewsRequest, GetUserByBookingRequest } from "@/dto/request/review.dto";
import { ApiResponse } from "@/types/responses";
import { ReviewResponse } from "@/dto/response/review.dto";

class ReviewController {
	readonly #reviewService: ReviewService;

	constructor(reviewService: ReviewService) {
		this.#reviewService = reviewService;
	}

	/**
	 * POST /reviews
	 * Tạo Review hoặc Reply
	 */
	public createReview = async (req: CreateReviewRequest, res: Response) => {
		try {
			const userId = req.userId;
			if (!userId) {
				return ResponseHelper.error(res, "Unauthorized", 401);
			}

			const payload = req.body;

			const hasBooking = Boolean(payload.bookingId);
			const hasParent = Boolean(payload.parentId);

			if (hasBooking === hasParent) {
				throw new BadRequestError("Invalid request: exactly one of bookingId or parentId must be provided");
			}

			let result;
			if (hasParent) {
				result = await this.#reviewService.createReply(userId, payload);
			} else {
				result = await this.#reviewService.createReview(userId, payload);
			}

			return ResponseHelper.success(res, result, 201);
		} catch (error) {
			const e = error as Error;
			return ResponseHelper.error(res, e.message, 400);
		}
	};

	/**
	 * GET /reviews/accommodation/:accommodationId
	 * Lấy danh sách review của một khách sạn
	 */
	public getAccommodationReviews = async (req: GetAccommodationReviewsRequest, res: Response<ApiResponse<ReviewResponse[]>>) => {
		try {
			const { accommodationId } = req.params;
			if (!accommodationId) {
				throw new BadRequestError("Missing accommodationId parameter");
			}

			const reviews = await this.#reviewService.getReviewsByAccommodation(accommodationId);

			return ResponseHelper.success(res, reviews);
		} catch (error) {
			const e = error as Error;
			return ResponseHelper.error(res, e.message, 400);
		}
	};
	public getMyReviewByBooking = async (req: GetUserByBookingRequest, res: Response) => {
		const userId = req.userId;
		const bookingId = req.params.bookingId;

		if (!bookingId) {
			return ResponseHelper.error(res, "Missing bookingId parameter", 400);
		}
		if (!userId) {
			return ResponseHelper.error(res, "Unauthorized", 401);
		}

		const review = await this.#reviewService.findByBookingAndUser(bookingId, userId);

		return ResponseHelper.success(res, review);
	};
}

export default ReviewController;
