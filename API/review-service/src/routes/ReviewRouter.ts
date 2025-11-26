import { Router } from "express";
import { AuthenticatedRequest, CreateReviewRequest, GetAccommodationReviewsRequest } from "../types/Request";
import ReviewController from "../controllers/ReviewController";
import ReviewService from "../services/ReviewService";
import BookingService from "../services/BookingService";
import BookingServiceClient from "../clients/BookingServiceClient";
import ReviewRepository from "../repositories/ReviewRepository";
import PrismaSingleton from "../clients/PrismaSingleton";
import { AuthMiddleware } from "../middlewares/AuthMiddleware";
import UserServiceClient from "../clients/UserServiceClient";

class ReviewRouterFactory {
	// Dependency Injection
	public static createReviewRouter() {
		const bookingServiceUrl = process.env["BOOKING_ENDPOINT"] ?? "http://localhost:3003";
		const userServiceUrl = process.env["USER_ENDPOINT"] ?? "http://localhost:3006";
		if (!bookingServiceUrl) {
			throw new Error("BOOKING_ENDPOINT environment variable is not set.");
		}

		const prisma = PrismaSingleton.getInstance();
		const userServiceClient = new UserServiceClient(userServiceUrl);
		const reviewRepository = new ReviewRepository(prisma);
		const reviewService = new ReviewService(reviewRepository, userServiceClient);
		const bookingServiceClient = new BookingServiceClient(bookingServiceUrl);
		const bookingService = new BookingService(bookingServiceClient);
		const reviewController = new ReviewController(reviewService, bookingService);
		const reviewRouter = new ReviewRouter(reviewController);

		return reviewRouter.router;
	}
}

class ReviewRouter {
	public router: Router;

	constructor(private reviewController: ReviewController) {
		this.router = Router();
		this.initializeRoutes();
	}

	private initializeRoutes() {
		this.router.post(
			"/",
			(req, res, next) => {
				return AuthMiddleware.verifyUser(req as AuthenticatedRequest, res, next);
			},
			(req, res) => {
				return this.reviewController.createReview(req as CreateReviewRequest, res);
			}
		);

		this.router.get("/accommodation/:accommodationId", (req, res) => {
			return this.reviewController.getAccommodationReviews(req as GetAccommodationReviewsRequest, res);
		});
	}
}

export default ReviewRouterFactory;
