import { Router, Request, Response } from "express";
import UserController from "@/controllers/user.controller";
import { authMiddleware } from "@/middlewares/auth.middleware";

class UserRouter {
	constructor(
		public router: Router,
		private userController: UserController
	) {
		this.registerRoutes();
	}

	private registerRoutes() {
		// POST /user/
		this.router.post("/", (req: Request, res: Response) => {
			return this.userController.createUser(req, res);
		});

		// PATCH /user/
		this.router.patch("/", (req: Request, res: Response) => {
			return this.userController.updateUser(req, res);
		});

		// GET /user/me
		this.router.get("/me", authMiddleware, (req: Request, res: Response) => {
			return this.userController.getMe(req, res);
		});
	}
}

export default UserRouter;
