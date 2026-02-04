import {
	AdminDeleteUserCommand,
	CognitoIdentityProviderClient,
	ConfirmSignUpCommand,
	SignUpCommand,
	AdminInitiateAuthCommand,
	ResendConfirmationCodeCommand,
	GlobalSignOutCommand,
	AdminCreateUserCommand,
	AdminSetUserPasswordCommand,
	AdminGetUserCommand,
	UserNotFoundException,
	ForgotPasswordCommand,
	ConfirmForgotPasswordCommand,
	AuthenticationResultType,
} from "@aws-sdk/client-cognito-identity-provider";
import CognitoClient from "@/clients/cognito.client";
import { AuthTokens } from "@/types/auth/auth-token";
import BadRequestError from "@/errors/BadRequestError";
import IdentityProviderError from "@/errors/IdentityProviderError";

export interface AuthServiceConfig {
	cognitoClient: CognitoIdentityProviderClient;
	googleClientSecret: string;
}

class AuthService {
	private readonly cognitoClient: CognitoIdentityProviderClient;
	private readonly googleClientSecret: string;

	constructor(config: AuthServiceConfig) {
		this.cognitoClient = config.cognitoClient;
		this.googleClientSecret = config.googleClientSecret;
	}

	public async signUp(email: string, password: string) {
		try {
			const command = new SignUpCommand({
				ClientId: CognitoClient.appClientId,
				Username: email,
				Password: password,
				UserAttributes: [{ Name: "email", Value: email }],
			});

			const response = await this.cognitoClient.send(command);
			return {
				userSub: response.UserSub!,
				destination: response.CodeDeliveryDetails?.Destination,
				deliveryMedium: response.CodeDeliveryDetails?.DeliveryMedium,
			};
		} catch (error) {
			console.error("[AuthService] SignUp Error:", error);
			throw error; // Để Controller hoặc Global Filter catch
		}
	}

	public async confirmSignUp(email: string, code: string): Promise<boolean> {
		try {
			const command = new ConfirmSignUpCommand({
				ClientId: CognitoClient.appClientId,
				Username: email,
				ConfirmationCode: code,
			});
			await this.cognitoClient.send(command);
			return true;
		} catch (error) {
			console.error("[AuthService] ConfirmSignUp Error:", error);
			return false;
		}
	}

	public async logIn(email: string, password: string): Promise<AuthTokens> {
		return this.executeAuthFlow(email, password);
	}

	// --- OAUTH FLOW (Google Proxy) ---

	public async oAuthSignUp(email: string): Promise<{ userSub: string }> {
		return this.provisionExternalUser(email, this.googleClientSecret);
	}

	public async oAuthLogin(email: string): Promise<AuthTokens> {
		return this.executeAuthFlow(email, this.googleClientSecret);
	} // --- UTILS ---

	public async findUser(email: string) {
		try {
			const command = new AdminGetUserCommand({
				UserPoolId: CognitoClient.userPoolId,
				Username: email,
			});
			return await this.cognitoClient.send(command);
		} catch (error) {
			if (error instanceof UserNotFoundException) return null;
			throw error;
		}
	}

	public async deleteAccount(email: string) {
		try {
			await this.cognitoClient.send(
				new AdminDeleteUserCommand({
					UserPoolId: CognitoClient.userPoolId,
					Username: email,
				})
			);
		} catch (error) {
			if (!(error instanceof UserNotFoundException)) throw error;
		}
	}

	public async refreshToken(refreshToken: string): Promise<AuthTokens> {
		const command = new AdminInitiateAuthCommand({
			UserPoolId: CognitoClient.userPoolId,
			ClientId: CognitoClient.appClientId,
			AuthFlow: "REFRESH_TOKEN_AUTH",
			AuthParameters: { REFRESH_TOKEN: refreshToken },
		});

		const response = await this.cognitoClient.send(command);
		return this.mapAuthResponse(response.AuthenticationResult!);
	}

	public async signOut(accessToken: string) {
		return await this.cognitoClient.send(new GlobalSignOutCommand({ AccessToken: accessToken }));
	} // --- PASSWORD RESET ---
	public async forgotPassword(email: string) {
		return await this.cognitoClient.send(
			new ForgotPasswordCommand({
				ClientId: CognitoClient.appClientId,
				Username: email,
			})
		);
	}

	public async confirmForgotPassword(email: string, code: string, newPassword: string) {
		return await this.cognitoClient.send(
			new ConfirmForgotPasswordCommand({
				ClientId: CognitoClient.appClientId,
				Username: email,
				ConfirmationCode: code,
				Password: newPassword,
			})
		);
	}

	public async getOtpCode(username: string) {
		return await this.cognitoClient.send(
			new ResendConfirmationCodeCommand({
				ClientId: CognitoClient.appClientId,
				Username: username,
			})
		);
	}

	// --- PRIVATE HELPERS ---

	/**
	 * Set email_verified when user created to avoid update attribute afterward.
	 */
	private async provisionExternalUser(email: string, tempPass: string): Promise<{ userSub: string }> {
		// 1. Create User + Set Verified Attributes
		const createCmd = new AdminCreateUserCommand({
			UserPoolId: CognitoClient.userPoolId,
			Username: email,
			TemporaryPassword: tempPass,
			UserAttributes: [
				{ Name: "email", Value: email },
				{ Name: "email_verified", Value: "true" }, // Set luôn ở đây
			],
			MessageAction: "SUPPRESS",
		});
		const createRes = await this.cognitoClient.send(createCmd);

		// Get UserSub from response
		const userSub = createRes.User?.Attributes?.find((a) => a.Name === "sub")?.Value || createRes.User?.Username;
		if (!userSub) throw new IdentityProviderError("Failed to retrieve User Sub");

		// Set Permanent Password
		await this.cognitoClient.send(
			new AdminSetUserPasswordCommand({
				UserPoolId: CognitoClient.userPoolId,
				Username: email,
				Password: tempPass,
				Permanent: true,
			})
		);

		return { userSub };
	}

	private async executeAuthFlow(username: string, password: string): Promise<AuthTokens> {
		const command = new AdminInitiateAuthCommand({
			UserPoolId: CognitoClient.userPoolId,
			ClientId: CognitoClient.appClientId,
			AuthFlow: "ADMIN_USER_PASSWORD_AUTH",
			AuthParameters: { USERNAME: username, PASSWORD: password },
		});

		const response = await this.cognitoClient.send(command);
		if (!response.AuthenticationResult) throw new IdentityProviderError("Auth Failed");

		return this.mapAuthResponse(response.AuthenticationResult);
	}

	private mapAuthResponse(auth: AuthenticationResultType): AuthTokens {
		return {
			accessToken: auth.AccessToken!,
			idToken: auth.IdToken!,
			refreshToken: auth.RefreshToken,
			expiresIn: auth.ExpiresIn!,
			tokenType: auth.TokenType!,
		};
	}
}

export default AuthService;
