import express, { type Router, type Request, type Response } from "express";
import ResponseHelper from "../utils/ResponseHelper.ts";
import UserController from "../controllers/UserController.ts";
import type { ApiResponse, UserResponse } from "../types/Response.ts";
import type { FindUserByIdRequest } from "../types/Request.ts";

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
        this.router.get("/health", (_: Request, res: Response) => {
            ResponseHelper.success(res, { service: "User Service", success: true });
        });

        // Get user by Id
        this.router.get("/:id", (req: FindUserByIdRequest, res: Response<ApiResponse<UserResponse>>) => {
            return this.userController.getUserById(req, res);
        });

        this.router.post("/save-cache", (req: Request, res: Response) => {
            return this.userController.cacheUser(req, res);
        });
    }
}

export default UserRouter;
