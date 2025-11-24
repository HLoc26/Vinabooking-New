import { Router } from "express";
import AuthController from "../controllers/AuthController";
import AuthRouter from "./AuthRouter";
import AuthService, { AuthServiceConfig } from "../services/AuthService";
import AuthRepository from "../repositories/AuthRespository";
import OAuthService, { GoogleOAuthConfig } from "../services/OAuthService";
import UserService from "../services/UserService";
import CognitoClient from "../clients/CognitoIdentityProviderClient";
import EnvironmentNotSetError from "../errors/EnvironmentNotSetError";
import { UserAxiosClient } from "../clients/UserServiceClient";
import PrismaSingleton from "../clients/PrismaSingleton";

class AuthRouterFactory {
	public static createAuthRouter() {
		// Cognito config
		const cognitoClient = CognitoClient.getInstance();
		const cognitoAppClientId = CognitoClient.clientId;

		// Google config
		const googleClientId = process.env["GOOGLE_CLIENT_ID"];
		if (!googleClientId) {
			throw new EnvironmentNotSetError("Missing GOOGLE_CLIENT_ID");
		}
		const googleClientSecret = process.env["GOOGLE_CLIENT_SECRET"];
		if (!googleClientSecret) {
			throw new EnvironmentNotSetError("Missing GOOGLE_CLIENT_SECRET");
		}
		const redirectUri = process.env["REDIRECT_URI"];
		if (!redirectUri) {
			throw new EnvironmentNotSetError("Missing REDIRECT_URI");
		}
		const clientUrl = process.env["CLIENT_URL"];
		if (!clientUrl) {
			throw new EnvironmentNotSetError("Missing CLIENT_URL");
		}

		const authServiceConfig: AuthServiceConfig = {
			cognitoAppClientId: cognitoAppClientId,
			cognitoClient: cognitoClient,
			googleClientSecret: googleClientSecret,
		};
		const oAuthServiceConfig: GoogleOAuthConfig = {
			clientId: googleClientId,
			clientSecret: googleClientSecret,
			redirectUri: redirectUri,
		};

		const userAxiosInstance = UserAxiosClient.getInstance();
		const prismaClient = PrismaSingleton.getInstance();

		const authService = new AuthService(authServiceConfig);
		const oAuthService = new OAuthService(oAuthServiceConfig);
		const userService = new UserService(userAxiosInstance);
		const authRepository = new AuthRepository(prismaClient);
		const authController = new AuthController(clientUrl, authService, userService, oAuthService, authRepository);
		const authRouter = new AuthRouter(Router(), authController);
		return authRouter.router;
	}
}

export default AuthRouterFactory;
