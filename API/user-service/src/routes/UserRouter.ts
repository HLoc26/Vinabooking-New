import express, { type Router, type Request, type Response } from "express";
import ResponseHelper from "../utils/ResponseHelper.ts";
import UserController from "../controllers/UserController.ts";

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
        this.router.get("/:id", (req: Request<{ id: string }>, res: Response) => this.userController.getUserById(req, res));
    }
}

export default UserRouter;
