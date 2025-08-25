import Router, { type Request, type Response } from "express";
import AuthController from "../controllers/AuthController.ts";
import ResponseHelper from "../utils/ResponseHelper.ts";

// Base route: /auth
class AuthRouter {
    public router = Router();
    private authController = new AuthController();

    constructor() {
        this.registerRoutes();
    }

    private registerRoutes() {
        this.router.get("/health", (_req: Request, res: Response) => {
            return ResponseHelper.success(res, { service: "Auth Service", success: true });
        });

        this.router.post("/sign-up", (req: Request, res: Response) => {
            return this.authController.signUp(req, res);
        });

        // this.router.post("/sign-up/confirm");

        // this.router.post("/sign-in");

        // this.router.get("/refresh-token");

        // this.router.post("/sign-out");
    }
}

export default AuthRouter;
