import express from "express";
import type { Router, Request, Response } from "express";
import AuthRouter from "./auth.routes";
import UserRouter from "./user.routes";
import RoomRouter from "./room.routes";
import ImageRouter from "./image.routes";
import AccommodationRouter from "./accommodation.routes";
import BookingRouter from "./booking.routes";
import ReviewRouter from "./review.routes";
import FacilityRouter from "./facility.routes";
import OwnerRouter from "./owner.routes";
import AmenityRouter from "./amenity.routes";
import SearchRouter from "./search.routes";

class AppRouter {
	#router: Router;

	constructor(
		private authRouter: AuthRouter,
		private userRouter: UserRouter,
		private imageRouter: ImageRouter,
		private roomRouter: RoomRouter,
		private accommodationRouter: AccommodationRouter,
		private bookingRouter: BookingRouter,
		private reviewRouter: ReviewRouter,
		private facilityRouter: FacilityRouter,
		private ownerRouter: OwnerRouter,
		private amenityRouter: AmenityRouter,
		private searchRouter: SearchRouter
	) {
		this.#router = express.Router();
		this.#registerRoutes();
	}

	#registerRoutes(): void {
		this.#router.get("/health", (_: Request, res: Response) => {
			res.status(200).json({ health: "ok" });
		});
		this.#router.use("/auth", this.authRouter.router);
		this.#router.use("/user", this.userRouter.router);
		this.#router.use("/rooms", this.roomRouter.router);
		this.#router.use("/images", this.imageRouter.router);
		this.#router.use("/accommodations", this.accommodationRouter.router);
		this.#router.use("/bookings", this.bookingRouter.router);
		this.#router.use("/reviews", this.reviewRouter.router);
		this.#router.use("/facilities", this.facilityRouter.router);
		this.#router.use("/owners", this.ownerRouter.router);
		this.#router.use("/amenities", this.amenityRouter.router);
		this.#router.use("/search", this.searchRouter.router);
	}

	public get router(): Router {
		return this.#router;
	}
}

export default AppRouter;
