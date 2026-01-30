import express from "express";
import type { Router, Request, Response } from "express";
import AuthRouter from "./auth.routes";

class AppRouter {
	#router: Router;

	constructor(private authRouter: AuthRouter) {
		this.#router = express.Router();
		this.#registerRoutes();
	}

	#registerRoutes(): void {
		this.#router.get("/health", (_: Request, res: Response) => {
			res.status(200).json({ health: "ok" });
		});
		this.#router.use("/auth", this.authRouter.router);
	}

	public get router(): Router {
		return this.#router;
	}
}

export default AppRouter;
