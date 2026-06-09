import type { AuthTokens } from "@/modules/auth/domain/AuthTokens";

/** Outcome of a completed Google OAuth callback: tokens + the FE redirect URL. */
export interface OAuthCallbackResult {
	tokens: AuthTokens | null;
	redirectUrl: string;
}

/** Use-case contract for third-party (Google) OAuth sign-in. */
export interface IOAuthService {
	/** Build the Google consent-screen authorize URL the FE should redirect to. */
	getGoogleAuthorizeUrl(): string;
	/** Exchange the Google auth code, provision/sync the user, and return the FE redirect. */
	handleGoogleCallback(code: string): Promise<OAuthCallbackResult>;
}
