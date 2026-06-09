import { EnvironmentNotSetError, IdentityProviderError } from "@/errors";
import { AuthProvider } from "@/models/auth";
import { AuthTokens } from "@/types/auth/auth-token";
import { GoogleOAuthResponse } from "@/types/responses";
import JwtService from "@/utils/jwt";
import AuthService from "./auth.service";
import UserService from "./user.service";

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


	constructor(
		configs: OAuthConfig, //
		userService: UserService,
		authService: AuthService
	) {
		this.#googleClientId = configs.googleClientId;
		this.#clientSecret = configs.clientSecret;
		this.#redirectUri = configs.redirectUri;
		this.#userService = userService;
		this.#authService = authService;


		let clientUrl = process.env["CLIENT_URL"];
		if (!clientUrl) {
			throw new EnvironmentNotSetError("Missing env variable: CLIENT_URL");
		}
		// Cũng lỗi giống FE dư dấu / dù set env không có
		if (clientUrl.endsWith("/")) {
			clientUrl = clientUrl.slice(0, -1);
		}
		this.#frontendUrl = clientUrl;
	}

	public async handleGoogleCallback(code: string): Promise<{ tokens: AuthTokens | null; redirectUrl: string }> {
		// 1. Lấy thông tin từ Google
		const userInfo = await this.exchangeUserInfo(code);
		const { email, name } = userInfo;

		// 2. Đảm bảo User có mặt trên Cognito
		try {
			await this.#authService.oAuthSignUp(email);
		} catch {
			// Ignore lỗi nếu user đã tồn tại
		}

		// 3. Login để lấy token
		const tokens = await this.#authService.oAuthLogin(email);

		// Giải mã Token để lấy "sub"
		const decodedIdToken = JwtService.parseJwt(tokens.idToken);
		const userId = decodedIdToken.sub;

		// 4. Đồng bộ DB
		let userInDb = null;
		try {
			userInDb = await this.#userService.getUser({ id: userId });
		} catch {
			userInDb = null;
		}

		if (!userInDb) {
			console.log(`[OAuth] User missing in DB. Creating now... ID: ${userId}`);

			// Xóa thằng cũ đi để tránh lỗi Unique Email (Trường hợp DB rác)
			try {
				const zombieUser = await this.#userService.getUser({ email });
				if (zombieUser) {
					console.warn(`[OAuth] Found zombie user with same email but different ID (${zombieUser.id}). Deleting...`);
				}
			} catch {
				// Ignore lỗi
			}

			// Tạo user mới
			await this.#userService.createUser({
				id: userId,
				email,
				name,
				phone: "",
			});
		}

		// 5. Liên kết provider (Nếu chưa có)
		const userProviders = await this.#authService.getUserProviders(email);
		if (!userProviders) {
			await this.#authService.createUserProvider(email, userId, AuthProvider.GOOGLE);
		}
		let hasGoogle = false;
		let hasCredentials = false;

		userProviders?.forEach((p) => {
			if (p.getProvider() === AuthProvider.CREDENTIALS) {
				hasCredentials = true;
			} else if (p.getProvider() === AuthProvider.GOOGLE) {
				hasGoogle = true;
			}
		});

		let userRole;
		try {
			const u = await this.#userService.getUser({ id: userId });
			userRole = u?.role;
		} catch {
			userRole = null;
		}

		if (!hasCredentials && !hasGoogle) {
			console.log(`[OAuth] Linking Google provider for: ${email}`);
			await this.#authService.createUserProvider(email, userId, AuthProvider.GOOGLE);
		}

		const userParams = encodeURIComponent(JSON.stringify({ id: userId, email, name, role: userRole }));
		const params = new URLSearchParams({
			accessToken: tokens.accessToken,
			idToken: tokens.idToken,
			expiresIn: tokens.expiresIn.toString(),
			user: userParams,
		});
		return { tokens, redirectUrl: `${this.#frontendUrl}/oauth/success?${params.toString()}` };
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
