import { injectable, singleton } from "tsyringe";
import {
	CognitoIdentityProviderClient,
	SignUpCommand,
	ConfirmSignUpCommand,
	AdminInitiateAuthCommand,
	AdminRespondToAuthChallengeCommand,
	AdminCreateUserCommand,
	AdminSetUserPasswordCommand,
	AdminGetUserCommand,
	AdminDeleteUserCommand,
	GlobalSignOutCommand,
	ResendConfirmationCodeCommand,
	ForgotPasswordCommand,
	ConfirmForgotPasswordCommand,
	UserNotFoundException,
	type SignUpCommandOutput,
	type AdminInitiateAuthCommandOutput,
	type AdminRespondToAuthChallengeCommandOutput,
	type AdminGetUserCommandOutput,
	type GlobalSignOutCommandOutput,
	type ResendConfirmationCodeCommandOutput,
	type ForgotPasswordCommandOutput,
	type ConfirmForgotPasswordCommandOutput,
} from "@aws-sdk/client-cognito-identity-provider";
import { NodeHttpHandler } from "@aws-sdk/node-http-handler";
import { Agent as HttpAgent } from "http";
import { Agent as HttpsAgent } from "https";
import { AppConfig } from "@/config/AppConfig";

/**
 * Thin wrapper around the AWS Cognito Identity Provider client (ports the
 * monolith's `cognito.client.ts` + the raw command sends from `auth.service.ts`).
 *
 * The underlying SDK client + pool/client ids are resolved LAZILY on first use,
 * so the app still boots without Cognito env configured — mirroring
 * `CognitoTokenVerifier`. Injected as a concrete @injectable class.
 */
@injectable()
@singleton()
export class CognitoIdpClient {
	private _client: CognitoIdentityProviderClient | undefined;

	constructor(private readonly config: AppConfig) {}

	private get client(): CognitoIdentityProviderClient {
		if (!this._client) {
			this._client = new CognitoIdentityProviderClient({
				region: this.config.getRequired("COGNITO_REGION"),
				requestHandler: new NodeHttpHandler({
					connectionTimeout: 10000,
					socketTimeout: 10000,
					httpAgent: new HttpAgent({ family: 4 }),
					httpsAgent: new HttpsAgent({ family: 4 }),
				}),
				credentials: {
					accessKeyId: this.config.getRequired("AWS_ACCESS_KEY_ID"),
					secretAccessKey: this.config.getRequired("AWS_SECRET_ACCESS_KEY"),
				},
			});
		}
		return this._client;
	}

	private get userPoolId(): string {
		return this.config.getRequired("COGNITO_USER_POOL_ID");
	}

	private get appClientId(): string {
		return this.config.getRequired("COGNITO_APP_CLIENT_ID");
	}

	public async signUp(email: string, password: string): Promise<SignUpCommandOutput> {
		return this.client.send(
			new SignUpCommand({
				ClientId: this.appClientId,
				Username: email,
				Password: password,
				UserAttributes: [{ Name: "email", Value: email }],
			})
		);
	}

	public async confirmSignUp(email: string, code: string): Promise<void> {
		await this.client.send(
			new ConfirmSignUpCommand({
				ClientId: this.appClientId,
				Username: email,
				ConfirmationCode: code,
			})
		);
	}

	public async adminUserPasswordAuth(email: string, password: string): Promise<AdminInitiateAuthCommandOutput> {
		return this.client.send(
			new AdminInitiateAuthCommand({
				UserPoolId: this.userPoolId,
				ClientId: this.appClientId,
				AuthFlow: "ADMIN_USER_PASSWORD_AUTH",
				AuthParameters: { USERNAME: email, PASSWORD: password },
			})
		);
	}

	public async refreshTokenAuth(refreshToken: string): Promise<AdminInitiateAuthCommandOutput> {
		return this.client.send(
			new AdminInitiateAuthCommand({
				UserPoolId: this.userPoolId,
				ClientId: this.appClientId,
				AuthFlow: "REFRESH_TOKEN_AUTH",
				AuthParameters: { REFRESH_TOKEN: refreshToken },
			})
		);
	}

	public async initiateCustomAuth(email: string): Promise<AdminInitiateAuthCommandOutput> {
		return this.client.send(
			new AdminInitiateAuthCommand({
				UserPoolId: this.userPoolId,
				ClientId: this.appClientId,
				AuthFlow: "CUSTOM_AUTH",
				AuthParameters: { USERNAME: email },
			})
		);
	}

	public async respondToCustomChallenge(email: string, answer: string, session: string | undefined): Promise<AdminRespondToAuthChallengeCommandOutput> {
		return this.client.send(
			new AdminRespondToAuthChallengeCommand({
				UserPoolId: this.userPoolId,
				ClientId: this.appClientId,
				ChallengeName: "CUSTOM_CHALLENGE",
				Session: session,
				ChallengeResponses: { USERNAME: email, ANSWER: answer },
			})
		);
	}

	public async adminCreateUser(email: string, temporaryPassword: string): Promise<string | undefined> {
		const res = await this.client.send(
			new AdminCreateUserCommand({
				UserPoolId: this.userPoolId,
				Username: email,
				TemporaryPassword: temporaryPassword,
				UserAttributes: [
					{ Name: "email", Value: email },
					{ Name: "email_verified", Value: "true" },
				],
				MessageAction: "SUPPRESS",
			})
		);
		return res.User?.Attributes?.find((a) => a.Name === "sub")?.Value ?? res.User?.Username;
	}

	public async adminSetPermanentPassword(email: string, password: string): Promise<void> {
		await this.client.send(
			new AdminSetUserPasswordCommand({
				UserPoolId: this.userPoolId,
				Username: email,
				Password: password,
				Permanent: true,
			})
		);
	}

	public async adminGetUser(email: string): Promise<AdminGetUserCommandOutput | null> {
		try {
			return await this.client.send(
				new AdminGetUserCommand({
					UserPoolId: this.userPoolId,
					Username: email,
				})
			);
		} catch (error) {
			if (error instanceof UserNotFoundException) return null;
			throw error;
		}
	}

	public async adminDeleteUser(email: string): Promise<void> {
		try {
			await this.client.send(
				new AdminDeleteUserCommand({
					UserPoolId: this.userPoolId,
					Username: email,
				})
			);
		} catch (error) {
			if (!(error instanceof UserNotFoundException)) throw error;
		}
	}

	public async globalSignOut(accessToken: string): Promise<GlobalSignOutCommandOutput> {
		return this.client.send(new GlobalSignOutCommand({ AccessToken: accessToken }));
	}

	public async resendConfirmationCode(email: string): Promise<ResendConfirmationCodeCommandOutput> {
		return this.client.send(
			new ResendConfirmationCodeCommand({
				ClientId: this.appClientId,
				Username: email,
			})
		);
	}

	public async forgotPassword(email: string): Promise<ForgotPasswordCommandOutput> {
		return this.client.send(
			new ForgotPasswordCommand({
				ClientId: this.appClientId,
				Username: email,
			})
		);
	}

	public async confirmForgotPassword(email: string, code: string, newPassword: string): Promise<ConfirmForgotPasswordCommandOutput> {
		return this.client.send(
			new ConfirmForgotPasswordCommand({
				ClientId: this.appClientId,
				Username: email,
				ConfirmationCode: code,
				Password: newPassword,
			})
		);
	}
}
