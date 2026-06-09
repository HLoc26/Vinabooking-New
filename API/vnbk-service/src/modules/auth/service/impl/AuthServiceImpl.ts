import { inject, injectable } from "tsyringe";
import type { AuthenticationResultType } from "@aws-sdk/client-cognito-identity-provider";
import type { IAuthService } from "@/modules/auth/service/IAuthService";
import { AUTH_PROVIDER_REPOSITORY } from "@/modules/auth/auth.tokens";
import type { IAuthProviderRepository } from "@/modules/auth/repository/IAuthProviderRepository";
import { AuthProvider } from "@/modules/auth/domain/AuthProvider";
import { EProvider } from "@/modules/auth/enums/EProvider";
import type { AuthTokens } from "@/modules/auth/domain/AuthTokens";
import { JwtDecoder } from "@/modules/auth/service/JwtDecoder";
import { CognitoIdpClient } from "@/infrastructure/auth-idp/CognitoIdpClient";
import { TOKEN_VERIFIER, MAIL_SENDER } from "@/infrastructure/infrastructure.tokens";
import type { ITokenVerifier } from "@/infrastructure/auth-idp/ITokenVerifier";
import type { IMailSender } from "@/infrastructure/mail/IMailSender";
import { USER_SERVICE } from "@/modules/user";
import type { IUserService } from "@/modules/user";
import { IdentityProviderError } from "@/shared/error/IdentityProviderError";
import { BadRequestError } from "@/shared/error/BadRequestError";
import type { SignUpRequest } from "@/modules/auth/dto/request/SignUpRequest";
import type { ConfirmUserRequest } from "@/modules/auth/dto/request/ConfirmUserRequest";
import type { LogInRequest } from "@/modules/auth/dto/request/LogInRequest";
import type { VerifyTokenRequest } from "@/modules/auth/dto/request/VerifyTokenRequest";
import type { ConfirmForgotPasswordRequest } from "@/modules/auth/dto/request/ConfirmForgotPasswordRequest";
import { SignUpResponse } from "@/modules/auth/dto/response/SignUpResponse";
import { ConfirmUserResponse } from "@/modules/auth/dto/response/ConfirmUserResponse";
import { LogInResponse } from "@/modules/auth/dto/response/LogInResponse";
import { AuthUserSummary } from "@/modules/auth/dto/response/AuthUserSummary";
import { RefreshResponse } from "@/modules/auth/dto/response/RefreshResponse";
import { VerifyResponse } from "@/modules/auth/dto/response/VerifyResponse";
import { GetOtpResponse } from "@/modules/auth/dto/response/GetOtpResponse";
import { SignOutResponse } from "@/modules/auth/dto/response/SignOutResponse";
import { ConfirmForgotPasswordResponse } from "@/modules/auth/dto/response/ConfirmForgotPasswordResponse";

/** Cognito-backed implementation of the credentials auth flows (ports auth.service.ts + auth.controller.ts). */
@injectable()
export class AuthServiceImpl implements IAuthService {
	constructor(
		private readonly cognito: CognitoIdpClient,
		private readonly jwt: JwtDecoder,
		@inject(USER_SERVICE) private readonly userService: IUserService,
		@inject(AUTH_PROVIDER_REPOSITORY) private readonly authProviderRepository: IAuthProviderRepository,
		@inject(TOKEN_VERIFIER) private readonly tokenVerifier: ITokenVerifier,
		@inject(MAIL_SENDER) private readonly mailSender: IMailSender
	) {}

	public async signUp(request: SignUpRequest): Promise<SignUpResponse> {
		// Step 1: register with Cognito.
		const result = await this.cognito.signUp(request.email, request.password);
		if (!result.UserSub) throw new IdentityProviderError("SignUp failed");

		// Step 2: stash the pending profile in the cache; roll back Cognito on failure.
		try {
			await this.userService.cachePendingUser({
				id: result.UserSub,
				email: request.email,
				name: request.name,
				phone: request.phone ?? null,
				role: request.userType,
			});
		} catch (error) {
			await this.cognito.adminDeleteUser(request.email);
			throw error;
		}

		const response = new SignUpResponse();
		response.userSub = result.UserSub;
		response.destination = result.CodeDeliveryDetails?.Destination;
		response.deliveryMedium = result.CodeDeliveryDetails?.DeliveryMedium;
		return response;
	}

	public async confirmUser(request: ConfirmUserRequest): Promise<ConfirmUserResponse> {
		// Step 1: verify the OTP with Cognito.
		try {
			await this.cognito.confirmSignUp(request.email, request.confirmCode);
		} catch (error) {
			console.error("[AuthService] ConfirmSignUp Error:", error);
			throw new BadRequestError("Invalid OTP Code");
		}

		// Step 2: persist the cached pending user.
		await this.userService.savePendingUser(request.email);

		// Step 3: link the Credentials provider.
		await this.authProviderRepository.create(
			AuthProvider.create({ userId: request.id, email: request.email, provider: EProvider.Credentials })
		);

		// Best-effort welcome email (a mail outage must not fail confirmation).
		void this.sendWelcome(request.email);

		const response = new ConfirmUserResponse();
		response.success = true;
		return response;
	}

	public async logIn(request: LogInRequest): Promise<LogInResponse> {
		// A Google-provisioned account must use the Google flow.
		const providers = await this.authProviderRepository.findByEmail(request.email);
		if (providers.some((p) => p.provider === EProvider.Google)) {
			throw new BadRequestError("Please login with Google");
		}

		const authResult = await this.cognito.adminUserPasswordAuth(request.email, request.password);
		if (!authResult.AuthenticationResult) throw new IdentityProviderError("Auth Failed");
		const tokens = this.mapAuthResult(authResult.AuthenticationResult);

		const { sub: userId } = await this.tokenVerifier.verify(tokens.idToken, "id");
		const user = await this.userService.findById(userId);

		const summary = new AuthUserSummary();
		summary.id = userId;
		summary.name = user?.name ?? null;
		summary.phone = user?.phone ?? null;
		summary.email = request.email;
		summary.role = user?.role ?? null;

		const response = new LogInResponse();
		response.accessToken = tokens.accessToken;
		response.idToken = tokens.idToken;
		response.refreshToken = tokens.refreshToken;
		response.expiresIn = tokens.expiresIn;
		response.tokenType = tokens.tokenType;
		response.user = summary;
		return response;
	}

	public async refresh(refreshToken: string): Promise<RefreshResponse> {
		const authResult = await this.cognito.refreshTokenAuth(refreshToken);
		if (!authResult.AuthenticationResult) throw new IdentityProviderError("Refresh failed");
		const tokens = this.mapAuthResult(authResult.AuthenticationResult);

		const response = new RefreshResponse();
		response.accessToken = tokens.accessToken;
		response.idToken = tokens.idToken;
		response.refreshToken = tokens.refreshToken;
		response.expiresIn = tokens.expiresIn;
		response.tokenType = tokens.tokenType;
		return response;
	}

	public async verifyToken(request: VerifyTokenRequest): Promise<VerifyResponse> {
		// Verify the signature/validity via the IDP verifier, then read extra claims.
		const verified = await this.tokenVerifier.verify(request.token, request.tokenType);
		const claims = this.jwt.decode<Record<string, unknown>>(request.token);
		const username = request.tokenType === "access" ? claims["username"] : claims["cognito:username"];

		if (typeof verified.sub !== "string" || typeof username !== "string") {
			throw new BadRequestError("Token payload missing required fields (sub or username)");
		}

		const user = await this.userService.findById(verified.sub);

		const response = new VerifyResponse();
		response.user = { id: verified.sub, username, role: user?.role ?? null };
		return response;
	}

	public async resendOtp(email: string): Promise<GetOtpResponse> {
		const result = await this.cognito.resendConfirmationCode(email);
		const response = new GetOtpResponse();
		response.codeDeliveryDestination = result.CodeDeliveryDetails?.Destination;
		response.codeDeliveryMedium = result.CodeDeliveryDetails?.DeliveryMedium;
		return response;
	}

	public async signOut(accessToken: string | undefined): Promise<SignOutResponse> {
		const response = new SignOutResponse();
		response.success = true;
		if (!accessToken) return response;

		try {
			const result = await this.cognito.globalSignOut(accessToken);
			const statusCode = result.$metadata?.httpStatusCode;
			if (statusCode !== 200) {
				console.error(`Error while signing out with code ${statusCode}`);
			}
		} catch (error) {
			console.warn("Cognito signOut failed, likely due to an expired or invalid token. Proceeding with logout.", error);
		}
		return response;
	}

	public async forgotPassword(email: string): Promise<GetOtpResponse> {
		const result = await this.cognito.forgotPassword(email);
		if (!result.CodeDeliveryDetails) {
			throw new IdentityProviderError("Failed to send reset code");
		}
		const response = new GetOtpResponse();
		response.codeDeliveryDestination = result.CodeDeliveryDetails.Destination;
		response.codeDeliveryMedium = result.CodeDeliveryDetails.DeliveryMedium?.toString();
		return response;
	}

	public async confirmForgotPassword(request: ConfirmForgotPasswordRequest): Promise<ConfirmForgotPasswordResponse> {
		try {
			await this.cognito.confirmForgotPassword(request.email, request.code, request.newPassword);
		} catch (error) {
			console.error("[AuthService] ConfirmForgotPassword Error:", error);
			throw new BadRequestError("Invalid or expired reset code");
		}
		const response = new ConfirmForgotPasswordResponse();
		response.success = true;
		return response;
	}

	// --- private helpers ---

	private mapAuthResult(auth: AuthenticationResultType): AuthTokens {
		return {
			accessToken: auth.AccessToken!,
			idToken: auth.IdToken!,
			refreshToken: auth.RefreshToken,
			expiresIn: auth.ExpiresIn!,
			tokenType: auth.TokenType!,
		};
	}

	private async sendWelcome(email: string): Promise<void> {
		const name = email.split("@")[0];
		try {
			await this.mailSender.send({
				to: email,
				subject: "Chào mừng đến với Vinabooking!",
				text: `Xin chào ${name}, cảm ơn bạn đã đăng ký tài khoản tại Vinabooking.`,
				html: `<p>Xin chào <b>${name}</b>! Cảm ơn bạn đã trở thành thành viên của Vinabooking.</p>`,
			});
		} catch (error) {
			console.error(`[AuthService] Failed to send welcome email to ${email}`, error);
		}
	}
}
