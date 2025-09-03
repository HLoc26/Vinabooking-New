import Router, { type Request, type Response } from "express";
import AuthController from "../controllers/AuthController.ts";
import ResponseHelper from "../utils/ResponseHelper.ts";
import type { NextFunction } from "express-serve-static-core";

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

        this.router.post(
            "/sign-up",
            // First sign up using Cognito
            (req: Request, res: Response, next: NextFunction) => {
                return this.authController.signUp(req, res, next);
            },
            // Then cache the user email and sub to cache
            (req: Request, res: Response) => {
                return this.authController.cacheUser(req, res);
            }
        );

        this.router.post(
            "/sign-up/confirm",
            // First confirm the OTP code
            (req: Request, res: Response, next: NextFunction) => {
                return this.authController.confirmUser(req, res, next);
            },
            // Then if confirm success, save user to db
            (req: Request, res: Response) => {
                return this.authController.saveUser(req, res);
            }
        );

        // this.router.post("/sign-in");

        // this.router.get("/refresh-token");

        // this.router.post("/sign-out");
    }
}

export default AuthRouter;
