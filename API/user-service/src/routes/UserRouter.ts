import express, { type Router, type Request, type Response } from "express";
import ResponseHelper from "../utils/ResponseHelper.ts";
import UserController from "../controllers/UserController.ts";
import type { FindUserByIdRequest } from "../types/Request.ts";
import redisClient from "../clients/RedisSingleton.ts";

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
            ResponseHelper.success(res, {
                user_service: "Healthy",
                redis: await redisClient.ping("Healthy"),
            });
        });

        // Get user by Id
        this.router.get("/:id", (req: FindUserByIdRequest, res: Response) => {
            return this.userController.getUserById(req, res);
        });

        this.router.post("/save-cache", (req: Request, res: Response) => {
            return this.userController.cacheUser(req, res);
        });
    }
}

export default UserRouter;
