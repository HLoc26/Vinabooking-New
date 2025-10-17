import { CognitoIdentityProviderClient } from "@aws-sdk/client-cognito-identity-provider";
import { NodeHttpHandler } from "@aws-sdk/node-http-handler";
import "dotenv";
import EnvironmentNotSetError from "../errors/EnvironmentNotSetError.ts";
import { Agent as HttpAgent } from "http";
import { Agent as HttpsAgent } from "https";

class CognitoClient {
    private static instance: CognitoIdentityProviderClient;
    public static readonly userPoolId: string = process.env["COGNITO_USER_POOL_ID"]!;

    constructor() {}

    public static getInstance() {
        const region = process.env["COGNITO_REGION"];
        if (!region) {
            throw new EnvironmentNotSetError("Missing COGNITO_REGION");
        }

        if (!CognitoClient.instance) {
            CognitoClient.instance = new CognitoIdentityProviderClient({
                // endpoint: "http://host.docker.internal:4566", // Use this if testing on local
                region: region,
                requestHandler: new NodeHttpHandler({
                    connectionTimeout: 10000,
                    socketTimeout: 10000,
                    httpAgent: new HttpAgent({ family: 4 }),
                    httpsAgent: new HttpsAgent({ family: 4 }),
                }),
                credentials: {
                    accessKeyId: process.env["ACCESS_KEY_ID"]!,
                    secretAccessKey: process.env["SECRET_ACCESS_KEY"]!,
                },
            });
        }
        return CognitoClient.instance;
    }
}

export default CognitoClient;
