import BookingController from "@/controllers/booking.controller";
import { authMiddleware } from "@/middlewares/auth.middleware";
import { Router, type Response } from "express";

class BookingRouter {
	constructor(
		public router: Router,
		private bookingController: BookingController
	) {
		this.registerRoutes();
	}

	private registerRoutes() {
		this.router.get("/", authMiddleware, (req, res) => this.bookingController.getBookings(req, res));

		this.router.post("/", authMiddleware, (req, res: Response) => {
			return this.bookingController.createBooking(req, res);
		});

		this.router.post("/draft", authMiddleware, (req, res: Response) => {
			return this.bookingController.createDraftBooking(req, res);
		});
		this.router.post("/confirm", authMiddleware, (req, res: Response) => {
			return this.bookingController.confirmBooking(req, res);
		});
		this.router.patch("/cancel", authMiddleware, (req, res) => {
			return this.bookingController.cancelBooking(req, res);
		});
	}
}
export default BookingRouter;
