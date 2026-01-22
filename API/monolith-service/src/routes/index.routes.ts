import express from "express";
import type { Router, Request, Response } from "express";

class AppRouter {
	#router: Router;

	constructor() {
		this.#router = express.Router();
		this.#registerRoutes();
	}

	#registerRoutes(): void {
		this.#router.get("/health", (_: Request, res: Response) => {
			res.status(200).json({ health: "ok" });
		});
	}

	public get router(): Router {
		return this.#router;
	}
}

export default AppRouter;
