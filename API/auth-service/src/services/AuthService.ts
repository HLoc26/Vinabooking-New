import {
    AdminDeleteUserCommand,
    CognitoIdentityProviderClient,
    ConfirmSignUpCommand,
    SignUpCommand,
} from "@aws-sdk/client-cognito-identity-provider";

import "dotenv/config";
import CognitoClient from "../clients/CognitoIdentityProviderClient.ts";
import EnvironmentNotSetError from "../errors/EnvironmentNotSetError.ts";
import type { SignUpResponse } from "../types/Response.ts";

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
            return { UserSub: response.UserSub };
        } catch (error) {
            console.error("[DEBUG] [SIGNUP] [ERROR]", error);
            throw error;
        }
    }

    public async confirmSignUp(username: string, confirmCode: string) {
        const command = new ConfirmSignUpCommand({
            ClientId: this.appClientID,
            Username: username,
            ConfirmationCode: confirmCode,
        });

        try {
            const response = await this.cognitoClient.send(command);
            return response;
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
}

export default AuthService;
