import { Router, Request, Response } from "express";
import AuthController from "@/controllers/auth.controller";
import {
	SignUpRequest, //
	ConfirmUserRequest,
	LogInRequest,
	VerifyRequest,
	GetOTPRequest,
	ForgotPasswordRequest,
	ConfirmForgotPasswordRequest,
	GoogleCallbackRequest,
} from "../dto/request";

class AuthRouter {
	constructor(
		public router: Router,
		private authController: AuthController
	) {
		this.registerRoutes();
	}

	private registerRoutes() {
		// --- Sign Up ---
		this.router.post("/sign-up", (req: Request, res: Response) => {
			return this.authController.signUp(req as SignUpRequest, res);
		});

		// --- OTP ---
		this.router.get("/otp", (req: Request, res: Response) => {
			return this.authController.getNewOtp(req as unknown as GetOTPRequest, res);
		});

		// --- Confirm User ---
		this.router.post("/sign-up/confirm", (req: Request, res: Response) => {
			return this.authController.confirmUser(req as ConfirmUserRequest, res);
		});

		// --- Log In ---
		this.router.post("/log-in", (req: Request, res: Response) => {
			return this.authController.logIn(req as LogInRequest, res);
		});

		// --- Refresh Token ---
		this.router.get("/refresh", (req: Request, res: Response) => {
			return this.authController.refreshToken(req, res);
		});

		// --- Verify Token ---
		this.router.post("/verify", (req: Request, res: Response) => {
			return this.authController.verifyToken(req as VerifyRequest, res);
		});

		// --- Sign Out ---
		this.router.post("/sign-out", (req: Request, res: Response) => {
			return this.authController.signOut(req, res);
		});

		// --- Google OAuth ---
		this.router.get("/google/callback", (req: Request, res: Response) => {
			return this.authController.googleCallback(req as unknown as GoogleCallbackRequest, res);
		});

		// --- Forgot Password ---
		this.router.post("/forgot-password", (req: Request, res: Response) => {
			return this.authController.forgotPassword(req as ForgotPasswordRequest, res);
		});

		this.router.post("/forgot-password/confirm", (req: Request, res: Response) => {
			return this.authController.confirmForgotPassword(req as ConfirmForgotPasswordRequest, res);
		});
	}
}

export default AuthRouter;
