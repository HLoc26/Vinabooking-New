import { CognitoIdentityProviderClient } from "@aws-sdk/client-cognito-identity-provider";
import { NodeHttpHandler } from "@aws-sdk/node-http-handler";
import "dotenv";
import EnvironmentNotSetError from "../errors/EnvironmentNotSetError.ts";
import { Agent as HttpAgent } from "http";
import { Agent as HttpsAgent } from "https";

class CognitoClient {
    private static instance: CognitoIdentityProviderClient;
    constructor() {}

    public static getInstance() {
        const region = process.env["COGNITO_REGION"];
        if (!region) {
            throw new EnvironmentNotSetError("Missing COGNITO_REGION");
        }

        if (!this.instance) {
            this.instance = new CognitoIdentityProviderClient({
                region: region,
                requestHandler: new NodeHttpHandler({
                    connectionTimeout: 10000,
                    socketTimeout: 10000,
                    httpAgent: new HttpAgent({ family: 4 }),
                    httpsAgent: new HttpsAgent({ family: 4 }),
                }),
            });
        }
        return this.instance;
    }
}

export default CognitoClient;
