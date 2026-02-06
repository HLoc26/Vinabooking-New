import express from "express";
import type { Router, Request, Response } from "express";
import AuthRouter from "./auth.routes";
import UserRouter from "./user.routes";
import RoomRouter from "./room.routes";
import ImageRouter from "./image.routes";

class AppRouter {
	#router: Router;

	constructor(
		private authRouter: AuthRouter,
		private userRouter: UserRouter,
    private imageRouter: ImageRouter,
		private roomRouter: RoomRouter
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
	}

	public get router(): Router {
		return this.#router;
	}
}

export default AppRouter;
