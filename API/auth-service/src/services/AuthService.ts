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
    AdminUpdateUserAttributesCommand,
    AdminGetUserCommand,
    UserNotFoundException,
} from "@aws-sdk/client-cognito-identity-provider";

import "dotenv/config";
import CognitoClient from "../clients/CognitoIdentityProviderClient";
import EnvironmentNotSetError from "../errors/EnvironmentNotSetError";
import type { SignUpResponse } from "../types/Response";

class AuthService {
    private appClientID: string;
    private cognitoClient: CognitoIdentityProviderClient;
    private GOOGLE_CLIENT_SECRET: string;
    constructor() {
        if (!process.env["COGNITO_APP_CLIENT_ID"]) {
            throw new EnvironmentNotSetError("Missing COGNITO_APP_CLIENT_ID");
        }

        this.appClientID = process.env["COGNITO_APP_CLIENT_ID"];
        this.cognitoClient = CognitoClient.getInstance();
        if (!process.env["GOOGLE_CLIENT_SECRET"]) {
            throw new EnvironmentNotSetError("Missing GOOGLE_CLIENT_SECRET");
        }
        this.GOOGLE_CLIENT_SECRET = process.env["GOOGLE_CLIENT_SECRET"];
    }

    public async signUp(email: string, password: string): Promise<SignUpResponse | null> {
        const command = new SignUpCommand({
            ClientId: this.appClientID,
            Username: email,
            Password: password,
            UserAttributes: [{ Name: "email", Value: email }],
        });

        try {
            const response = await this.cognitoClient.send(command);
            return {
                UserSub: response.UserSub,
                CodeDeliveryDestination: response.CodeDeliveryDetails?.Destination,
                CodeDeliveryMedium: response.CodeDeliveryDetails?.DeliveryMedium,
            };
        } catch (error) {
            console.error("[DEBUG] [SIGNUP] [ERROR]", error);
            throw error;
        }
    }

    public async createUserWithoutVerification(email: string, password: string) {
        try {
            // 1. Create user with preset password
            const createCommand = new AdminCreateUserCommand({
                UserPoolId: CognitoClient.userPoolId,
                Username: email,
                TemporaryPassword: password,
                UserAttributes: [{ Name: "email", Value: email }],
                MessageAction: "SUPPRESS",
            });
            const createResponse = await this.cognitoClient.send(createCommand);

            // 2. Set password permanent
            const setPwdCommand = new AdminSetUserPasswordCommand({
                UserPoolId: CognitoClient.userPoolId,
                Username: email,
                Password: password,
                Permanent: true,
            });
            await this.cognitoClient.send(setPwdCommand);

            // 3. Mark email is verified
            const updateAttrsCommand = new AdminUpdateUserAttributesCommand({
                UserPoolId: CognitoClient.userPoolId,
                Username: email,
                UserAttributes: [{ Name: "email_verified", Value: "true" }],
            });

            await this.cognitoClient.send(updateAttrsCommand);

            //4. Get user to get userSub
            const getUserCommand = new AdminGetUserCommand({
                UserPoolId: CognitoClient.userPoolId,
                Username: email,
            });
            const getUserResponse = await this.cognitoClient.send(getUserCommand);

            const subAttr = getUserResponse.UserAttributes?.find((a) => a.Name === "sub")?.Value;

            return {
                UserSub: subAttr ?? getUserResponse.Username ?? createResponse.User?.Username,
            };
        } catch (error) {
            console.error("[DEBUG] [CREATE_USER_NO_VERIF] [ERROR]", error);
            throw error;
        }
    }

    public async oAuthSignUp(email: string) {
        return this.createUserWithoutVerification(email, this.GOOGLE_CLIENT_SECRET);
    }

    public async oAuthLogin(email: string) {
        return this.logIn(email, this.GOOGLE_CLIENT_SECRET);
    }

    public async findUser(username: string) {
        const command = new AdminGetUserCommand({
            Username: username,
            UserPoolId: CognitoClient.userPoolId,
        });
        try {
            const response = await this.cognitoClient.send(command);
            return response;
        } catch (error) {
            console.error("[DEBUG] [FIND_USER] [ERROR]", error);
            if (error instanceof UserNotFoundException) {
                return null;
            }
            throw error;
        }
    }

    public async confirmSignUp(username: string, confirmCode: string): Promise<boolean> {
        const command = new ConfirmSignUpCommand({
            ClientId: this.appClientID,
            Username: username,
            ConfirmationCode: String(confirmCode),
        });

        try {
            const response = await this.cognitoClient.send(command);
            return response.$metadata.httpStatusCode == 200;
        } catch (error) {
            console.error("[DEBUG] [CONFIRM] [ERROR]", error);
            throw error;
        }
    }

    public async deleteAccount(username: string) {
        const command = new AdminDeleteUserCommand({
            UserPoolId: CognitoClient.userPoolId,
            Username: username, // user's email
        });
        try {
            const response = await this.cognitoClient.send(command);
            return response;
        } catch (error) {
            console.error("[DEBUG] [DELETE] [ERROR]", error);
            throw error;
        }
    }

    public async logIn(email: string, password: string) {
        const command = new AdminInitiateAuthCommand({
            UserPoolId: CognitoClient.userPoolId,
            AuthFlow: "ADMIN_USER_PASSWORD_AUTH",
            ClientId: this.appClientID,
            AuthParameters: {
                USERNAME: email,
                PASSWORD: password,
            },
        });
        try {
            const response = await this.cognitoClient.send(command);
            return response;
        } catch (error) {
            console.error("[DEBUG] [LOG IN]", error);
            throw error;
        }
    }

    public async refreshToken(refreshToken: string) {
        const command = new AdminInitiateAuthCommand({
            UserPoolId: CognitoClient.userPoolId,
            AuthFlow: "REFRESH_TOKEN_AUTH",
            ClientId: this.appClientID,
            AuthParameters: {
                REFRESH_TOKEN: refreshToken,
            },
        });

        try {
            const response = await this.cognitoClient.send(command);
            return response;
        } catch (error) {
            console.error("[DEBUG] [REFRESH]", error);
            throw error;
        }
    }

    public async getOtpCode(username: string) {
        const command = new ResendConfirmationCodeCommand({
            ClientId: CognitoClient.clientId,
            Username: username,
        });
        try {
            const response = await this.cognitoClient.send(command);
            return response;
        } catch (error) {
            console.error("[DEBUG] [RESEND OTP]", error);
            throw error;
        }
    }

    public async signOut(accessToken: string) {
        const command = new GlobalSignOutCommand({
            AccessToken: accessToken,
        });
        try {
            const response = await this.cognitoClient.send(command);
            return response;
        } catch (error) {
            console.error("[DEBUG] [SIGN OUT]", error);
            throw error;
        }
    }
}

export default AuthService;
