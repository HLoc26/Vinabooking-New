import { inject, injectable } from "tsyringe";
import type { IOAuthService, OAuthCallbackResult } from "@/modules/auth/service/IOAuthService";
import { AUTH_PROVIDER_REPOSITORY } from "@/modules/auth/auth.tokens";
import type { IAuthProviderRepository } from "@/modules/auth/repository/IAuthProviderRepository";
import { AuthProvider } from "@/modules/auth/domain/AuthProvider";
import { EProvider } from "@/modules/auth/enums/EProvider";
import type { AuthTokens } from "@/modules/auth/domain/AuthTokens";
import { JwtDecoder } from "@/modules/auth/service/JwtDecoder";
import { CognitoIdpClient } from "@/infrastructure/auth-idp/CognitoIdpClient";
import { MAIL_SENDER } from "@/infrastructure/infrastructure.tokens";
import type { IMailSender } from "@/infrastructure/mail/IMailSender";
import { USER_SERVICE, ERole } from "@/modules/user";
import type { IUserService } from "@/modules/user";
import { AppConfig } from "@/config/AppConfig";
import { IdentityProviderError } from "@/shared/error/IdentityProviderError";

/** The Google id_token claims we consume in the OAuth callback. */
interface GoogleIdTokenClaims {
	sub: string;
	email: string;
	name: string;
}

/** Google OAuth (proxy-to-Cognito) implementation. Ports oauth.service.ts. */
@injectable()
export class OAuthServiceImpl implements IOAuthService {
	constructor(
		private readonly cognito: CognitoIdpClient,
		private readonly jwt: JwtDecoder,
		@inject(USER_SERVICE) private readonly userService: IUserService,
		@inject(AUTH_PROVIDER_REPOSITORY) private readonly authProviderRepository: IAuthProviderRepository,
		@inject(MAIL_SENDER) private readonly mailSender: IMailSender,
		private readonly config: AppConfig
	) {}

	public getGoogleAuthorizeUrl(): string {
		const params = new URLSearchParams({
			client_id: this.config.getRequired("GOOGLE_CLIENT_ID"),
			redirect_uri: this.config.getRequired("GOOGLE_REDIRECT_URI"),
			response_type: "code",
			scope: "openid email profile",
			access_type: "offline",
			prompt: "consent",
		});
		return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
	}

	public async handleGoogleCallback(code: string): Promise<OAuthCallbackResult> {
		// 1. Exchange the auth code for the Google id_token + read its claims.
		const userInfo = await this.exchangeUserInfo(code);
		const { email, name } = userInfo;

		// 2. Ensure the user exists on Cognito (ignore "already exists").
		try {
			await this.provisionExternalUser(email);
		} catch {
			// User already provisioned — proceed to login.
		}

		// 3. Custom-auth login to obtain tokens.
		const tokens = await this.customAuthLogin(email);

		// Decode the id_token to read the Cognito sub.
		const userId = this.jwt.decode<{ sub: string }>(tokens.idToken).sub;

		// 4. Sync the DB user.
		const userInDb = await this.userService.findById(userId);
		if (!userInDb) {
			console.log(`[OAuth] User missing in DB. Creating now... ID: ${userId}`);
			await this.userService.create({ cognitoSub: userId, email, name, role: ERole.TRAVELLER });
		}

		// 5. Link the Google provider if not already linked.
		const providers = await this.authProviderRepository.findByEmail(email);
		const hasGoogle = providers.some((p) => p.provider === EProvider.Google);
		const hasCredentials = providers.some((p) => p.provider === EProvider.Credentials);
		if (!hasGoogle && !hasCredentials) {
			console.log(`[OAuth] Linking Google provider for: ${email}`);
			await this.authProviderRepository.create(
				AuthProvider.create({ userId, email, provider: EProvider.Google })
			);
		}

		const role = userInDb?.role ?? ERole.TRAVELLER;
		const userParams = encodeURIComponent(JSON.stringify({ id: userId, email, name, role }));
		const params = new URLSearchParams({
			accessToken: tokens.accessToken,
			idToken: tokens.idToken,
			expiresIn: tokens.expiresIn.toString(),
			user: userParams,
		});
		return { tokens, redirectUrl: `${this.frontendUrl()}/oauth/success?${params.toString()}` };
	}

	// --- private helpers ---

	private async exchangeUserInfo(code: string): Promise<GoogleIdTokenClaims> {
		const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				code,
				client_id: this.config.getRequired("GOOGLE_CLIENT_ID"),
				client_secret: this.config.getRequired("GOOGLE_CLIENT_SECRET"),
				redirect_uri: this.config.getRequired("GOOGLE_REDIRECT_URI"),
				grant_type: "authorization_code",
			}),
		});

		const data = (await tokenRes.json()) as { id_token?: string; error?: string; error_description?: string };
		if (!tokenRes.ok) {
			const errorMessage = data.error_description ?? data.error ?? "Unknown error";
			throw new IdentityProviderError(`Invalid response from googleapis: ${errorMessage}`);
		}
		if (!data.id_token) {
			throw new IdentityProviderError("Google response did not contain an id_token");
		}
		return this.jwt.decode<GoogleIdTokenClaims>(data.id_token);
	}

	/** Create the Cognito user with verified email + a permanent password (the Google client secret). */
	private async provisionExternalUser(email: string): Promise<void> {
		const tempPass = this.config.getRequired("GOOGLE_CLIENT_SECRET");
		const userSub = await this.cognito.adminCreateUser(email, tempPass);
		if (!userSub) throw new IdentityProviderError("Failed to retrieve User Sub");
		await this.cognito.adminSetPermanentPassword(email, tempPass);
		void this.sendWelcome(email);
	}

	/** Drive the Cognito CUSTOM_AUTH challenge using the backend bypass secret. */
	private async customAuthLogin(email: string): Promise<AuthTokens> {
		const init = await this.cognito.initiateCustomAuth(email);
		if (init.ChallengeName !== "CUSTOM_CHALLENGE") {
			throw new IdentityProviderError(`Unexpected Challenge: ${init.ChallengeName}`);
		}
		const backendSecret = this.config.getRequired("BACKEND_SECRET_KEY");
		const response = await this.cognito.respondToCustomChallenge(email, backendSecret, init.Session);
		if (!response.AuthenticationResult) {
			throw new IdentityProviderError("Custom Auth Failed: No Tokens returned");
		}
		const auth = response.AuthenticationResult;
		return {
			accessToken: auth.AccessToken!,
			idToken: auth.IdToken!,
			refreshToken: auth.RefreshToken,
			expiresIn: auth.ExpiresIn!,
			tokenType: auth.TokenType!,
		};
	}

	private frontendUrl(): string {
		let clientUrl = this.config.getRequired("CLIENT_URL");
		if (clientUrl.endsWith("/")) clientUrl = clientUrl.slice(0, -1);
		return clientUrl;
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
			console.error(`[OAuth] Failed to send welcome email to ${email}`, error);
		}
	}
}
