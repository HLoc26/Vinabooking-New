import type { SignUpRequest } from "@/modules/auth/dto/request/SignUpRequest";
import type { ConfirmUserRequest } from "@/modules/auth/dto/request/ConfirmUserRequest";
import type { LogInRequest } from "@/modules/auth/dto/request/LogInRequest";
import type { VerifyTokenRequest } from "@/modules/auth/dto/request/VerifyTokenRequest";
import type { ConfirmForgotPasswordRequest } from "@/modules/auth/dto/request/ConfirmForgotPasswordRequest";
import type { SignUpResponse } from "@/modules/auth/dto/response/SignUpResponse";
import type { ConfirmUserResponse } from "@/modules/auth/dto/response/ConfirmUserResponse";
import type { LogInResponse } from "@/modules/auth/dto/response/LogInResponse";
import type { RefreshResponse } from "@/modules/auth/dto/response/RefreshResponse";
import type { VerifyResponse } from "@/modules/auth/dto/response/VerifyResponse";
import type { GetOtpResponse } from "@/modules/auth/dto/response/GetOtpResponse";
import type { SignOutResponse } from "@/modules/auth/dto/response/SignOutResponse";
import type { ConfirmForgotPasswordResponse } from "@/modules/auth/dto/response/ConfirmForgotPasswordResponse";

/** Use-case contract for the auth module (Cognito-backed credentials flows). */
export interface IAuthService {
	/** Register a Cognito user and stash the pending profile until OTP confirmation. */
	signUp(request: SignUpRequest): Promise<SignUpResponse>;
	/** Confirm the sign-up OTP, persist the cached user, and link the Credentials provider. */
	confirmUser(request: ConfirmUserRequest): Promise<ConfirmUserResponse>;
	/** Authenticate with email + password; returns tokens + the DB user summary. */
	logIn(request: LogInRequest): Promise<LogInResponse>;
	/** Exchange a refresh token for fresh access/id tokens. */
	refresh(refreshToken: string): Promise<RefreshResponse>;
	/** Verify a Cognito token and return its subject + role. */
	verifyToken(request: VerifyTokenRequest): Promise<VerifyResponse>;
	/** Resend the sign-up confirmation OTP. */
	resendOtp(email: string): Promise<GetOtpResponse>;
	/** Globally sign out the access token (best-effort). */
	signOut(accessToken: string | undefined): Promise<SignOutResponse>;
	/** Start the forgot-password flow (Cognito sends a reset OTP). */
	forgotPassword(email: string): Promise<GetOtpResponse>;
	/** Confirm the reset OTP and set the new password. */
	confirmForgotPassword(request: ConfirmForgotPasswordRequest): Promise<ConfirmForgotPasswordResponse>;
}
