import Router, { type Request, type Response, type NextFunction } from "express";
import AuthController from "../controllers/AuthController";
import ResponseHelper from "../utils/ResponseHelper";
import { GetOTPRequest } from "../types/Request";

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

        this.router.get("/otp", (req: Request, res: Response) => {
            const request = req as unknown as GetOTPRequest;
            return this.authController.getNewOtp(request, res);
        });

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

        this.router.post("/log-in", (req: Request, res: Response) => {
            return this.authController.logIn(req, res);
        });

        this.router.post("/refresh", (req: Request, res: Response) => {
            return this.authController.refreshToken(req, res);
        });

        this.router.post("/verify", (req: Request, res: Response) => {
            return this.authController.verifyToken(req, res);
        });

        // this.router.post("/sign-out");
    }
}

export default AuthRouter;
