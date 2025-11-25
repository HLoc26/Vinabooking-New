import { Router } from "express";
import { CreateReviewRequest } from "../types/Request";
import ReviewController from "../controllers/ReviewController";
import ReviewService from "../services/ReviewService";
import BookingService from "../services/BookingService";
import BookingServiceClient from "../clients/BookingServiceClient";
import ReviewRepository from "../repositories/ReviewRepository";
import PrismaSingleton from "../clients/PrismaSingleton";

class ReviewRouterFactory {
	// Dependency Injection
	public static createReviewRouter() {
		const bookingServiceUrl = process.env["BOOKING_ENDPOINT"] ?? "http://localhost:3003";

		if (!bookingServiceUrl) {
			throw new Error("BOOKING_ENDPOINT environment variable is not set.");
		}

		const prisma = PrismaSingleton.getInstance();
		const reviewRepository = new ReviewRepository(prisma);
		const reviewService = new ReviewService(reviewRepository);
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
		this.router.post("/", (req, res) => {
			return this.reviewController.createReview(req as CreateReviewRequest, res);
		});
	}
}

export default ReviewRouterFactory;
