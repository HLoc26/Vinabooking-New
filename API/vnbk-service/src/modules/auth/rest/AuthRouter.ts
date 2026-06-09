import { injectable } from "tsyringe";
import { BaseRouter } from "@/http/BaseRouter";
import { AuthController } from "@/modules/auth/rest/AuthController";
import { AuthGuard } from "@/http/middleware/AuthGuard";
import { ValidationPipe } from "@/http/middleware/ValidationPipe";
import { SignUpRequest } from "@/modules/auth/dto/request/SignUpRequest";
import { ConfirmUserRequest } from "@/modules/auth/dto/request/ConfirmUserRequest";
import { LogInRequest } from "@/modules/auth/dto/request/LogInRequest";
import { VerifyTokenRequest } from "@/modules/auth/dto/request/VerifyTokenRequest";
import { ForgotPasswordRequest } from "@/modules/auth/dto/request/ForgotPasswordRequest";
import { ConfirmForgotPasswordRequest } from "@/modules/auth/dto/request/ConfirmForgotPasswordRequest";
import { GetOtpQuery } from "@/modules/auth/dto/request/GetOtpQuery";

@injectable()
export class AuthRouter extends BaseRouter {
	constructor(
		private readonly controller: AuthController,
		private readonly auth: AuthGuard,
		private readonly validate: ValidationPipe
	) {
		super();
		this.registerRoutes();
	}

	public get basePath(): string {
		return "/auth";
	}

	protected registerRoutes(): void {
		// --- Sign Up ---
		this.router.post("/sign-up", this.validate.body(SignUpRequest), this.controller.signUp);
		this.router.post("/sign-up/confirm", this.validate.body(ConfirmUserRequest), this.controller.confirmUser);

		// --- OTP ---
		this.router.get("/otp", this.validate.query(GetOtpQuery), this.controller.getNewOtp);

		// --- Log In / Sessions ---
		this.router.post("/log-in", this.validate.body(LogInRequest), this.controller.logIn);
		this.router.get("/refresh", this.controller.refreshToken);
		this.router.post("/verify", this.validate.body(VerifyTokenRequest), this.controller.verifyToken);
		this.router.post("/sign-out", this.controller.signOut);

		// --- Google OAuth ---
		this.router.get("/google", this.controller.googleAuthorize);
		this.router.get("/google/callback", this.controller.googleCallback);

		// --- Forgot Password ---
		this.router.post("/forgot-password", this.validate.body(ForgotPasswordRequest), this.controller.forgotPassword);
		this.router.post("/forgot-password/confirm", this.validate.body(ConfirmForgotPasswordRequest), this.controller.confirmForgotPassword);
	}
}
