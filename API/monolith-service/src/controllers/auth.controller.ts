import { type Response, type Request } from "express";
import { LogInRequest, SignUpRequest, ConfirmUserRequest, ConfirmForgotPasswordRequest, ForgotPasswordRequest, GetOTPRequest, VerifyRequest, GoogleCallbackRequest } from "@/types/requests";
import ResponseHelper from "@/utils/response";
import type {
	ApiResponse,
	ConfirmForgotPasswordResponse,
	ConfirmUserResponse,
	ForgotPasswordResponse,
	GetOTPResponse,
	LogInResponse,
	RefreshResponse,
	SignOutResponse,
	SignUpResponse,
	VerifyResponse,
} from "@/types/responses";

import { OAuthService, AuthService, UserService } from "@/services";
import { EProvider } from "@/generated/client";
import JwtService from "@/utils/jwt";
import { AuthRepository } from "@/repositories";
import { ETokenType } from "@/types/auth/auth-token";
import IdentityProviderError from "@/errors/IdentityProviderError";
import BadRequestError from "@/errors/BadRequestError";
import DatabaseError from "@/errors/DatabaseError";

class AuthController {
	readonly #authService: AuthService;
	readonly #userService: UserService;
	readonly #oauthService: OAuthService;
	readonly #authRepository: AuthRepository;
	constructor(authService: AuthService, userService: UserService, oauthService: OAuthService, authRepository: AuthRepository) {
		this.#authService = authService;
		this.#userService = userService;
		this.#oauthService = oauthService;
		this.#authRepository = authRepository;
	}

	// 1. SignUp Flow (Gộp SignUp và Cache làm 1 flow xử lý)
	public async signUp(req: SignUpRequest, res: Response<ApiResponse<SignUpResponse>>) {
		const { email, password, name, phone, userType } = req.body;

		// Step 1: SignUp Cognito
		const cognitoResp = await this.#authService.signUp(email, password);
		if (!cognitoResp?.userSub) throw new IdentityProviderError("SignUp failed");

		// Step 2: Cache User
		try {
			await this.#userService.cacheUser({
				email,
				info: {
					id: cognitoResp.userSub,
					email,
					name,
					phone,
					role: userType,
				},
			});
		} catch (error) {
			// Rollback nếu cache lỗi
			await this.#authService.deleteAccount(email);
			const e = error as Error;
			ResponseHelper.error(res, e.message, 500);
		}

		return ResponseHelper.success<SignUpResponse>(res, cognitoResp);
	}

	public async confirmUser(req: ConfirmUserRequest, res: Response<ApiResponse<ConfirmUserResponse>>) {
		const { id, email, confirmCode } = req.body;

		// Step 1: Verify OTP
		const isConfirmed = await this.#authService.confirmSignUp(email, confirmCode);
		if (!isConfirmed) throw new BadRequestError("Invalid OTP Code");

		// Step 2: Save to DB from Cache
		const savedUser = await this.#userService.saveUserFromCache(email);
		if (!savedUser) throw new DatabaseError("Failed to save user to DB");

		// Step 3: Create Provider Record
		await this.#authRepository.createUserProvider(id, email, EProvider.Credentials);

		return ResponseHelper.success<ConfirmUserResponse>(res, { success: true });
	}

	public async logIn(req: LogInRequest, res: Response<ApiResponse<LogInResponse>>) {
		const { email, password } = req.body;

		// Check Provider (Logic check provider nên đẩy xuống Service nếu có thể)
		const userProviders = await this.#authRepository.getUserProviders(email);
		if (userProviders?.map((p) => p.provider).includes(EProvider.Google)) {
			throw new BadRequestError("Please login with Google");
		}

		// Login Cognito, returns DTO
		const tokens = await this.#authService.logIn(email, password);

		// Get User Info DB
		const userId = (await JwtService.verifyToken(tokens.idToken, "id")).sub;
		const userInDb = await this.#userService.getUserById(userId);

		// Set Cookie
		this.setRefreshTokenCookie(res, tokens.refreshToken);

		return ResponseHelper.success<LogInResponse>(res, {
			...tokens,
			user: {
				id: userId,
				name: userInDb?.name,
				phone: userInDb?.phone,
				email: email,
			},
		});
	}

	private setRefreshTokenCookie(res: Response, token?: string) {
		if (!token) return;
		res.cookie("refresh_token", token, {
			httpOnly: true,
			secure: true,
			sameSite: "none",
			maxAge: 30 * 24 * 60 * 60 * 1000,
		});
	}

	public async verifyToken(req: VerifyRequest, res: Response<ApiResponse<VerifyResponse>>) {
		const { token, tokenType } = req.body;

		const payload = tokenType === ETokenType.ACCESS ? await JwtService.verifyToken(token, "access") : await JwtService.verifyToken(token, "id");

		if (!payload) throw new BadRequestError("Invalid Token");
		const username = tokenType === ETokenType.ACCESS ? payload.username : payload["cognito:username"];

		// Check null/undefined
		if (typeof payload.sub !== "string" || typeof username !== "string") {
			throw new BadRequestError("Token payload missing required fields (sub or username)");
		}
		return ResponseHelper.success<VerifyResponse>(res, {
			user: {
				id: payload.sub,
				username: username,
			},
		});
	}

	public async refreshToken(req: Request, res: Response<ApiResponse<RefreshResponse>>) {
		const refreshToken = req.cookies.refresh_token;
		if (!refreshToken) throw new BadRequestError("Missing refresh token");

		const tokens = await this.#authService.refreshToken(refreshToken);
		return ResponseHelper.success<RefreshResponse>(res, tokens);
	}

	public async getNewOtp(req: GetOTPRequest, res: Response<ApiResponse<GetOTPResponse>>) {
		const username = req.query.email;
		const cognitoResponse = await this.#authService.getOtpCode(username);

		const response: GetOTPResponse = {
			CodeDeliveryDestination: cognitoResponse.CodeDeliveryDetails?.Destination,
			CodeDeliveryMedium: cognitoResponse.CodeDeliveryDetails?.DeliveryMedium,
		};

		return ResponseHelper.success<GetOTPResponse>(res, response);
	}

	public async signOut(req: Request, res: Response<ApiResponse<SignOutResponse>>) {
		const authHeader = req.headers.authorization;
		console.log(req.headers);
		if (!authHeader?.startsWith("Bearer ")) {
			throw new BadRequestError("Access token missing");
		}

		const accessToken = authHeader.split(" ")[1];

		const response = await this.#authService.signOut(accessToken);
		const statusCode = response.$metadata?.httpStatusCode;

		if (statusCode !== 200) {
			throw new IdentityProviderError(`Error while signing out with code ${statusCode}`);
		}

		return ResponseHelper.success<SignOutResponse>(res, { success: true });
	}

	public async googleCallback(req: GoogleCallbackRequest, res: Response) {
		try {
			const { code } = req.query;
			if (!code || typeof code !== "string") throw new BadRequestError("Missing code or invalid request");

			const { tokens, redirectUrl } = await this.#oauthService.handleGoogleCallback(code);

			if (redirectUrl.includes("/error")) {
				let errorMessage = "Google Login Failed";
				try {
					const urlObj = new URL(redirectUrl);
					const msgParam = urlObj.searchParams.get("message");
					if (msgParam) errorMessage = msgParam;
				} catch {
					// Ignore invalid URL error, keep default message
				}
				throw new Error(errorMessage);
			}

			this.setRefreshTokenCookie(res, tokens?.refreshToken);
			return res.redirect(redirectUrl);
		} catch (error) {
			const message = error instanceof Error ? error.message : "Unknown error";
			console.error("Google Callback Error:", message);

			let clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
			if (clientUrl.endsWith("/")) clientUrl = clientUrl.slice(0, -1);

			return res.redirect(`${clientUrl}/auth/login?error=${encodeURIComponent(message)}`);
		}
	}

	public async forgotPassword(req: ForgotPasswordRequest, res: Response<ApiResponse<ForgotPasswordResponse>>) {
		const { email } = req.body;
		if (!email) {
			throw new BadRequestError("Missing email");
		}

		// Cognito send OTP to email
		const result = await this.#authService.forgotPassword(email);
		if (!result.CodeDeliveryDetails) {
			throw new IdentityProviderError("Failed to send reset code");
		}

		const response = {
			CodeDeliveryDestination: result.CodeDeliveryDetails.Destination,
			CodeDeliveryMedium: result.CodeDeliveryDetails.DeliveryMedium?.toString(),
		};

		return ResponseHelper.success<ForgotPasswordResponse>(res, response);
	}

	public async confirmForgotPassword(req: ConfirmForgotPasswordRequest, res: Response<ApiResponse<ConfirmForgotPasswordResponse>>) {
		const { email, code, newPassword } = req.body;
		if (!email || !code || !newPassword) {
			throw new BadRequestError("Missing required fields");
		}

		// Confirm OTP and update new password
		const result = await this.#authService.confirmForgotPassword(email, code, newPassword);
		if (!result) {
			throw new BadRequestError("Invalid or expired reset code");
		}

		return ResponseHelper.success<ConfirmForgotPasswordResponse>(res, { success: true });
	}
}

export default AuthController;
