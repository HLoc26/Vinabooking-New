import { NextFunction, Router, type Request, type Response } from "express";
import ResponseHelper from "../utils/ResponseHelper";
import BookingController from "../controllers/BookingController";
import BookingRepository from "../repositories/BookingRepository";
import BookingService from "../services/BookingService";
import { AuthMiddleware } from "../middleware/AuthMiddleware";
import { AuthenticatedRequest } from "../types/Request";
import accommodationClient from "../clients/AccommodationServiceClient";

class BookingRouterFactory {
	static createBookingRouter() {
		const bookingRepository = new BookingRepository();
		const bookingService = new BookingService(bookingRepository);
		const bookingController = new BookingController(bookingService, bookingRepository);

		const bookingRouter = new BookingRouter(bookingController, Router());
		return bookingRouter.router;
	}
}

class BookingRouter {
	constructor(
		private readonly bookingController: BookingController,
		public readonly router: Router
	) {
		this.registerRoutes();
	}

	private registerRoutes() {
		this.router.get("/health", (_req: Request, res: Response) => {
			return ResponseHelper.success(res, {
				service: "Booking Service",
				success: true,
			});
		});

		this.router.use((req: Request, res: Response, next: NextFunction) => {
			return AuthMiddleware.verifyUser(req as AuthenticatedRequest, res, next);
		});

		this.router.get(
			"/",
			async (req, res, next) => {
				if (req.query.entity === "accommodation") {
					try {
						const data = await accommodationClient.getAccommodationsByRoomId(String(req.query.id));
						console.log("Accommodation info:", data);
					} catch (err) {
						console.error(err);
						return ResponseHelper.error(res, "Failed to fetch accommodation info");
					}
				}
				next();
			},
			(req, res) => this.bookingController.getBookings(req, res)
		);

		this.router.post("/", (req, res: Response) => {
			return this.bookingController.createBooking(req as AuthenticatedRequest, res);
		});

		this.router.post("/draft", (req, res: Response) => {
			return this.bookingController.createDraftBooking(req as AuthenticatedRequest, res);
		});
	}
}

export default BookingRouterFactory;
