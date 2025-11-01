import { NextFunction, Router, type Request, type Response } from "express";
import ResponseHelper from "../utils/ResponseHelper";
import BookingController from "../controllers/BookingController";
import BookingRepository from "../repositories/BookingRepository";
import BookingService from "../services/BookingService";
import { AuthMiddleware } from "../middleware/AuthMiddleware";
import { AuthenticatedRequest } from "../types/Request";

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
            this.router.get("/", (req: Request, res: Response) => {
                return this.bookingController.getBookings(req, res);
            });
            this.router.post("/", (req,res: Response, next: NextFunction)=>{
                return AuthMiddleware.verifyUser(req as AuthenticatedRequest, res, next)
            },(req, res: Response) => { 
                return this.bookingController.createBooking(req as AuthenticatedRequest , res);
            });
            this.router.post("/draft", (req,res: Response, next: NextFunction)=>{
                return AuthMiddleware.verifyUser(req as AuthenticatedRequest, res, next)
            },(req, res: Response) => { 
                return this.bookingController.createDraftBooking(req as AuthenticatedRequest , res);
            })};
    }


export default BookingRouterFactory;
