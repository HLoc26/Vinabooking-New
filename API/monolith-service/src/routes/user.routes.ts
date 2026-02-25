import { Router, Request, Response } from "express";
import UserController from "@/controllers/user.controller";
import { authMiddleware } from "@/middlewares/auth.middleware";

class UserRouter {
	constructor(
		public router: Router,
		private readonly userController: UserController
	) {
		this.registerRoutes();
	}

	private registerRoutes() {
		// --- BASE USER ROUTES ---
		this.router.post("/", (req: Request, res: Response) => this.userController.createUser(req, res));
		this.router.patch("/", authMiddleware, (req: Request, res: Response) => this.userController.updateUser(req, res));
		this.router.get("/me", authMiddleware, (req: Request, res: Response) => this.userController.getMe(req, res));

		// GET /user?id=...&withFavourites=true
		this.router.get("/", authMiddleware, (req: Request, res: Response) => this.userController.getUser(req, res));

		// --- FAVOURITES ROUTES ---
		this.router.post("/favourites", authMiddleware, (req: Request, res: Response) => this.userController.createFavouriteList(req, res));
		this.router.delete("/favourites", authMiddleware, (req: Request, res: Response) => this.userController.deleteFavouriteList(req, res));
		this.router.patch("/favourites/:id", authMiddleware, (req: Request, res: Response) => this.userController.updateFavouriteList(req, res));
		this.router.post("/favourites/accommodation", authMiddleware, (req: Request, res: Response) => this.userController.addAccommodationToFavourite(req, res));
		this.router.delete("/favourites/accommodation", authMiddleware, (req: Request, res: Response) => this.userController.removeAccommodationFromFavourite(req, res));
	}
}

export default UserRouter;
