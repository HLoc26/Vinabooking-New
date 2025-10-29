import express, { type Router, type Request, type Response } from "express";
import ResponseHelper from "../utils/ResponseHelper";
import UserController from "../controllers/UserController";
import type { FindUserByIdRequest } from "../types/Request";
import { getRedisClient } from "../clients/RedisSingleton"; // thay đổi từ default export sang function

// Base route: /users
class UserRouter {
    public router: Router;
    private userController: UserController;

    constructor() {
        this.router = express.Router();
        this.userController = new UserController();
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

        // Get user by Id
        this.router.get("/:id", (req: FindUserByIdRequest, res: Response) => {
            return this.userController.getUserById(req, res);
        });

        this.router.post("/cache", (req: Request, res: Response) => {
            return this.userController.cacheUser(req, res);
        });

        this.router.post("/db", (req: Request, res: Response) => {
            return this.userController.saveUserFromCache(req, res);
        });
    }
}

export default UserRouter;
