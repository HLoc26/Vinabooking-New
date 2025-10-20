import { Router, type Request, type Response } from "express";
import ResponseHelper from "../utils/ResponseHelper";
import BookingController from "../controllers/BookingController";
import BookingRepository from "../repositories/BookingRepository";
import BookingService from "../services/BookingService";

class BookingRouterFactory {
    static createBookingRouter() {
        const bookingRepository = new BookingRepository();
        const bookingService = new BookingService(bookingRepository);
        const bookingController = new BookingController(bookingService);

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
            return ResponseHelper.success(res, { service: "Booking Service", success: true });
        });

        this.router.get("/:id", (req: Request, res: Response) => {
            return this.bookingController.getBookingById(req, res);
        });
        this.router.get("/user/:userId", (req: Request, res: Response) => {
            return this.bookingController.getBookingsByUserId(req, res);
        });        
    }
}

export default BookingRouterFactory;
