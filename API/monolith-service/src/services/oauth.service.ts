import { GoogleOAuthResponse } from "../types/responses/google-oauth.response";
import JwtService from "../utils/jwt";
import CognitoClient from "@clients/cognito.client";

class OAuthService {
	readonly #clientSecret: string;
	readonly #redirectUri: string;

	constructor(clientSecret: string, redirectUri: string) {
		this.#clientSecret = clientSecret;
		this.#redirectUri = redirectUri;
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
				client_id: CognitoClient.appClientId,
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
			throw new Error(`Invalid response from googleapis: ${errorMessage}`);
		}

		// Extract the ID token
		const { id_token } = data;

		if (!id_token) {
			throw new Error("Google response did not contain an id_token");
		}

		// Decode the ID token to get user info
		const userInfo: GoogleOAuthResponse = JwtService.parseJwt(id_token);

		return userInfo;
	}
}

export default OAuthService;
