import {
    AdminDeleteUserCommand,
    CognitoIdentityProviderClient,
    ConfirmSignUpCommand,
    SignUpCommand,
    AdminInitiateAuthCommand,
    ResendConfirmationCodeCommand,
} from "@aws-sdk/client-cognito-identity-provider";

import "dotenv/config";
import CognitoClient from "../clients/CognitoIdentityProviderClient";
import EnvironmentNotSetError from "../errors/EnvironmentNotSetError";
import type { SignUpResponse } from "../types/Response";

class AuthService {
    private appClientID: string;
    private cognitoClient: CognitoIdentityProviderClient;

    constructor() {
        if (!process.env["COGNITO_APP_CLIENT_ID"]) {
            throw new EnvironmentNotSetError("Missing COGNITO_APP_CLIENT_ID");
        }

        this.appClientID = process.env["COGNITO_APP_CLIENT_ID"];
        this.cognitoClient = CognitoClient.getInstance();
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
}

export default AuthService;
