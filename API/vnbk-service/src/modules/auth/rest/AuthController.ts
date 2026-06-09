import { inject, injectable } from "tsyringe";
import type { Request, Response, RequestHandler } from "express";
import { BaseController } from "@/http/BaseController";
import { ResponseEnvelope } from "@/shared/http/ResponseEnvelope";
import { AUTH_SERVICE, OAUTH_SERVICE } from "@/modules/auth/auth.tokens";
import type { IAuthService } from "@/modules/auth/service/IAuthService";
import type { IOAuthService } from "@/modules/auth/service/IOAuthService";
import { AppConfig } from "@/config/AppConfig";
import { BadRequestError } from "@/shared/error/BadRequestError";
import type { SignUpRequest } from "@/modules/auth/dto/request/SignUpRequest";
import type { ConfirmUserRequest } from "@/modules/auth/dto/request/ConfirmUserRequest";
import type { LogInRequest } from "@/modules/auth/dto/request/LogInRequest";
import type { VerifyTokenRequest } from "@/modules/auth/dto/request/VerifyTokenRequest";
import type { ForgotPasswordRequest } from "@/modules/auth/dto/request/ForgotPasswordRequest";
import type { ConfirmForgotPasswordRequest } from "@/modules/auth/dto/request/ConfirmForgotPasswordRequest";
import type { GetOtpQuery } from "@/modules/auth/dto/request/GetOtpQuery";
import type { SignUpResponse } from "@/modules/auth/dto/response/SignUpResponse";
import type { ConfirmUserResponse } from "@/modules/auth/dto/response/ConfirmUserResponse";
import type { VerifyResponse } from "@/modules/auth/dto/response/VerifyResponse";
import type { GetOtpResponse } from "@/modules/auth/dto/response/GetOtpResponse";
import type { ConfirmForgotPasswordResponse } from "@/modules/auth/dto/response/ConfirmForgotPasswordResponse";

const REFRESH_COOKIE = "refresh_token";
const REFRESH_COOKIE_MAX_AGE = 30 * 24 * 60 * 60 * 1000;

@injectable()
export class AuthController extends BaseController {
	constructor(
		@inject(AUTH_SERVICE) private readonly authService: IAuthService,
		@inject(OAUTH_SERVICE) private readonly oauthService: IOAuthService,
		private readonly config: AppConfig
	) {
		super();
	}

	public signUp = this.handle<SignUpResponse>(async (req: Request) => {
		const dto = req.validatedBody as SignUpRequest;
		return this.ok(await this.authService.signUp(dto));
	});

	public confirmUser = this.handle<ConfirmUserResponse>(async (req: Request) => {
		const dto = req.validatedBody as ConfirmUserRequest;
		return this.ok(await this.authService.confirmUser(dto));
	});

	public verifyToken = this.handle<VerifyResponse>(async (req: Request) => {
		const dto = req.validatedBody as VerifyTokenRequest;
		return this.ok(await this.authService.verifyToken(dto));
	});

	public getNewOtp = this.handle<GetOtpResponse>(async (req: Request) => {
		const dto = req.validatedQuery as GetOtpQuery;
		return this.ok(await this.authService.resendOtp(dto.email));
	});

	public forgotPassword = this.handle<GetOtpResponse>(async (req: Request) => {
		const dto = req.validatedBody as ForgotPasswordRequest;
		return this.ok(await this.authService.forgotPassword(dto.email));
	});

	public confirmForgotPassword = this.handle<ConfirmForgotPasswordResponse>(async (req: Request) => {
		const dto = req.validatedBody as ConfirmForgotPasswordRequest;
		return this.ok(await this.authService.confirmForgotPassword(dto));
	});

	// --- handlers that touch the response (cookies / redirects) directly ---

	public logIn: RequestHandler = async (req, res, next) => {
		try {
			const dto = req.validatedBody as LogInRequest;
			const result = await this.authService.logIn(dto);
			this.setRefreshTokenCookie(res, result.refreshToken);
			ResponseEnvelope.success(res, result, 200);
		} catch (err) {
			next(err);
		}
	};

	public refreshToken: RequestHandler = async (req, res, next) => {
		try {
			const refreshToken = (req.cookies as Record<string, string> | undefined)?.[REFRESH_COOKIE];
			if (!refreshToken) throw new BadRequestError("Missing refresh token");
			const result = await this.authService.refresh(refreshToken);
			ResponseEnvelope.success(res, result, 200);
		} catch (err) {
			next(err);
		}
	};

	public signOut: RequestHandler = async (req, res, next) => {
		try {
			res.clearCookie(REFRESH_COOKIE, { httpOnly: true, secure: true, sameSite: "none" });
			const authHeader = req.headers.authorization;
			const accessToken = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : undefined;
			const result = await this.authService.signOut(accessToken);
			ResponseEnvelope.success(res, result, 200);
		} catch (err) {
			next(err);
		}
	};

	public googleAuthorize: RequestHandler = (_req, res, next) => {
		try {
			res.redirect(this.oauthService.getGoogleAuthorizeUrl());
		} catch (err) {
			next(err);
		}
	};

	public googleCallback: RequestHandler = async (req, res) => {
		try {
			const code = req.query.code;
			if (!code || typeof code !== "string") throw new BadRequestError("Missing code or invalid request");
			const { tokens, redirectUrl } = await this.oauthService.handleGoogleCallback(code);
			this.setRefreshTokenCookie(res, tokens?.refreshToken);
			res.redirect(redirectUrl);
		} catch (error) {
			const message = error instanceof Error ? error.message : "Unknown error";
			console.error("Google Callback Error:", message);
			res.redirect(`${this.frontendUrl()}/oauth/error?message=${encodeURIComponent(message)}`);
		}
	};

	// --- private helpers ---

	private setRefreshTokenCookie(res: Response, token?: string): void {
		if (!token) return;
		res.cookie(REFRESH_COOKIE, token, {
			httpOnly: true,
			secure: true,
			sameSite: "none",
			maxAge: REFRESH_COOKIE_MAX_AGE,
		});
	}

	private frontendUrl(): string {
		let clientUrl = this.config.get("CLIENT_URL") ?? "http://localhost:5173";
		if (clientUrl.endsWith("/")) clientUrl = clientUrl.slice(0, -1);
		return clientUrl;
	}
}
