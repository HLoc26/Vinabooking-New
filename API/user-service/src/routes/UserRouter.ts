import express, { type Router, type Request, type Response } from "express";
import ResponseHelper from "../utils/ResponseHelper";
import UserController from "../controllers/UserController";
import type {
	AuthenticatedAddAccommodationRequest,
	AuthenticatedCreateFavouriteListRequest,
	AuthenticatedDeleteFavouriteListRequest,
	AuthenticatedRemoveAccommodationRequest,
	AuthenticatedUpdateFavouriteListRequest,
	AuthenticatedUpdateUserRequest,
	FindUserByIdRequest,
	FindUserRequest,
	SaveUserDirectRequest,
} from "../types/Request";
import { getRedisClient } from "../clients/RedisSingleton"; // thay đổi từ default export sang function
import { authMiddleware } from "../middlewares/AuthMiddleware";
import FavouriteController from "../controllers/FavouriteController";

// Base route: /users
class UserRouter {
	public router: Router;
	private userController: UserController;
	private favouriteController: FavouriteController;

	constructor() {
		this.router = express.Router();
		this.userController = new UserController();
		this.favouriteController = new FavouriteController();
		this.registerRoutes();
	}

	private registerRoutes(): void {
		// health check
		this.router.get("/health", async (_: Request, res: Response) => {
			const redis = await getRedisClient();
			const ping = await redis.ping("Healthy");
			ResponseHelper.success(res, {
				user_service: "Healthy",
				redis: ping,
			});
		});

		this.router.post("/", (req: SaveUserDirectRequest, res: Response) => {
			return this.userController.saveUserDirect(req, res);
		});

		this.router.get("/", (req: FindUserRequest, res: Response) => {
			return this.userController.getUser(req, res);
		});

		// Get user by Id
		this.router.get("/:id", (req: FindUserByIdRequest, res: Response) => {
			return this.userController.getUserById(req, res);
		});

		this.router.patch("/:id", authMiddleware, (req: Request, res: Response) => {
			return this.userController.updateUser(req as AuthenticatedUpdateUserRequest, res);
		});

		this.router.post("/cache", (req: Request, res: Response) => {
			return this.userController.cacheUser(req, res);
		});

		this.router.post("/db", (req: Request, res: Response) => {
			return this.userController.saveUserFromCache(req, res);
		});

		// POST /users/favourites/accommodation
		this.router.post("/favourites/accommodation", authMiddleware, (req, res) => {
			return this.favouriteController.addAccommodationToFavouriteList(req as AuthenticatedAddAccommodationRequest, res);
		});

		// DELETE /users/favourites/accommodation?accommodationId=:aId&listId=lId
		this.router.delete("/favourites/accommodation", authMiddleware, (req, res) => {
			return this.favouriteController.removeAccommodationFromFavouriteList(req as AuthenticatedRemoveAccommodationRequest, res);
		});

		this.router.post("/favourites", authMiddleware, (req, res) => {
			return this.favouriteController.createFavouriteList(req as AuthenticatedCreateFavouriteListRequest, res);
		});

		this.router.delete("/favourites", authMiddleware, (req, res) => {
			return this.favouriteController.deleteFavouriteList(req as AuthenticatedDeleteFavouriteListRequest, res);
		});

		this.router.patch("/favourites/:listId", authMiddleware, (req, res) => {
			return this.favouriteController.updateFavouriteList(req as AuthenticatedUpdateFavouriteListRequest, res);
		});
	}
}

export default UserRouter;
