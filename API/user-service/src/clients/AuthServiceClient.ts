import axios, { AxiosInstance } from "axios";

export class AuthServiceClientSingleton {
	private static instance: AuthServiceClientSingleton;
	private client: AxiosInstance;
	private constructor() {
		const baseURL = process.env.AUTH_ENDPOINT;
		if (!baseURL) throw new Error("AUTH_ENDPOINT not defined in environment variables");

		this.client = axios.create({ baseURL });
	}

	public static getInstance(): AuthServiceClientSingleton {
		if (!AuthServiceClientSingleton.instance) {
			AuthServiceClientSingleton.instance = new AuthServiceClientSingleton();
		}
		return AuthServiceClientSingleton.instance;
	}

	/**
	 * Verify an access token via auth-service
	 * @param token The access token
	 */
	public async verifyAccessToken(token: string) {
		try {
			const response = await this.client.post("/verify", {
				token,
				tokenType: "ACCESS",
			});
			return response.data; // expected: { user: { id: string, username: string } }
		} catch (e: unknown) {
			console.error(e);
			throw new Error("Failed to verify access token");
		}
	}
}
