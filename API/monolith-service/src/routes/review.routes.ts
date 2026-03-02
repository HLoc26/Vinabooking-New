import { Router } from "express";
import ReviewController from "@/controllers/review.controller";
import { authMiddleware } from "@/middlewares/auth.middleware";

class ReviewRouter {
	public router: Router;

	constructor(
		router: Router,
		private readonly reviewController: ReviewController
	) {
		this.router = router;
		this.initRoutes();
	}

	private initRoutes() {
		// GET /reviews/accommodation/:accommodationId
		this.router.get("/accommodation/:accommodationId", this.reviewController.getAccommodationReviews);
		this.router.get("/booking/:bookingId/me", authMiddleware, this.reviewController.getMyReviewByBooking);
		// POST /reviews
		this.router.post("/", authMiddleware, this.reviewController.createReview);
	}
}

export default ReviewRouter;
