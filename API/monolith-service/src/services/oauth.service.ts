import { GoogleOAuthResponse } from "@/types/responses";
import JwtService from "@/utils/jwt";
import UserService from "./user.service";
import AuthService from "./auth.service";
import { EProvider } from "@/generated/enums";
import { AuthRepository, UserRepository } from "@/repositories";
import { AuthTokens } from "@/types/auth/auth-token";
import EnvironmentNotSetError from "@/errors/EnvironmentNotSetError";
import IdentityProviderError from "@/errors/IdentityProviderError";

export interface OAuthConfig {
	googleClientId: string;
	clientSecret: string;
	redirectUri: string;
}

class OAuthService {
	readonly #frontendUrl: string;
	readonly #googleClientId: string;
	readonly #clientSecret: string;
	readonly #redirectUri: string;
	readonly #userService: UserService;
	readonly #authService: AuthService;
	readonly #authRepository: AuthRepository;
	readonly #userRepository: UserRepository;

	constructor(
		configs: OAuthConfig, //
		userService: UserService,
		authService: AuthService,
		authRepository: AuthRepository,
		userRepository: UserRepository
	) {
		this.#googleClientId = configs.googleClientId;
		this.#clientSecret = configs.clientSecret;
		this.#redirectUri = configs.redirectUri;
		this.#userService = userService;
		this.#authService = authService;
		this.#authRepository = authRepository;
		this.#userRepository = userRepository;
		if (!process.env["CLIENT_URL"]) {
			throw new EnvironmentNotSetError("Missing env variable: CLIENT_URL");
		}
		this.#frontendUrl = process.env["CLIENT_URL"]!;
	}

	public async handleGoogleCallback(code: string): Promise<{ tokens: AuthTokens | null; redirectUrl: string }> {
		// 1. Exchange Code
		const userInfo = await this.exchangeUserInfo(code);
		const { email, name } = userInfo;

		// 2. Check Existence
		const userInDb = await this.#userService.getUser({ email });
		const userInCognito = await this.#authService.findUser(email);

		// 3. Register if new
		if (!userInDb && !userInCognito) {
			const cognitoSub = (await this.#authService.oAuthSignUp(email)).userSub;
			await this.#authRepository.createUserProvider(cognitoSub, email, EProvider.Google);
			const { userSub } = await this.#authService.oAuthSignUp(email);
			await this.#userRepository.createUser({ id: userSub, email, name });
		}

		// 4. Validate Provider
		const userAuthProvider = await this.#authRepository.getUserProviders(email);
		if (userAuthProvider?.map((p) => p.provider).includes(EProvider.Credentials)) {
			const msg = encodeURIComponent("This account uses password login.");
			return { tokens: null, redirectUrl: `${this.#frontendUrl}/oauth/error?message=${msg}` };
		}

		// 5. Login & Get Tokens
		const tokens = await this.#authService.oAuthLogin(email);
		const userId = (await JwtService.verifyToken(tokens.idToken, "id")).sub;

		// 6. Build Success URL
		const redirectUrl = this.#buildSuccessUrl(tokens, userId, email, name);
		return { tokens, redirectUrl };
	}

	#buildSuccessUrl(tokens: AuthTokens, userId: string, email: string, name: string): string {
		const userParams = encodeURIComponent(JSON.stringify({ id: userId, email, name }));
		const params = new URLSearchParams({
			accessToken: tokens.accessToken,
			idToken: tokens.idToken,
			expiresIn: tokens.expiresIn.toString(),
			user: userParams,
		});

		// Trả về full URL
		return `${this.#frontendUrl}/oauth/success?${params.toString()}`;
	}

	public async exchangeUserInfo(code: string): Promise<GoogleOAuthResponse> {
		// Exchange code -> token
		const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				code,
				client_id: this.#googleClientId,
				client_secret: this.#clientSecret,
				redirect_uri: this.#redirectUri,
				grant_type: "authorization_code",
			}),
		});

		// Parse the response body
		const data = await tokenRes.json();

		if (!tokenRes.ok) {
			// It is helpful to log the actual error message from Google for debugging
			const errorMessage = data.error_description || data.error || "Unknown error";
			throw new IdentityProviderError(`Invalid response from googleapis: ${errorMessage}`);
		}

		// Extract the ID token
		const { id_token } = data;

		if (!id_token) {
			throw new IdentityProviderError("Google response did not contain an id_token");
		}

		// Decode the ID token to get user info
		const userInfo: GoogleOAuthResponse = JwtService.parseJwt(id_token);

		return userInfo;
	}
}

export default OAuthService;
