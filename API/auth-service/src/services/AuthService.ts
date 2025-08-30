import { CognitoIdentityProviderClient, SignUpCommand } from "@aws-sdk/client-cognito-identity-provider";

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

    public async signUp(username: string, password: string, email: string): Promise<SignUpResponse | null> {
        const command = new SignUpCommand({
            ClientId: this.appClientID,
            Username: username,
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
}

export default AuthService;
