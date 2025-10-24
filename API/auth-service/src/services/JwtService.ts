import { CognitoJwtVerifier } from "aws-jwt-verify";
import CognitoClient from "../clients/CognitoIdentityProviderClient";

class JwtService {
    public static async verifyAccessToken(token: string) {
        const verifier = CognitoJwtVerifier.create({
            userPoolId: CognitoClient.userPoolId,
            tokenUse: "access",
            clientId: CognitoClient.clientId,
        });
        const payload = await verifier.verify(token);
        return payload;
    }

    public static async verifyIdToken(token: string) {
        const verifier = CognitoJwtVerifier.create({
            userPoolId: CognitoClient.userPoolId,
            tokenUse: "id",
            clientId: CognitoClient.clientId,
        });
        const payload = await verifier.verify(token);
        return payload;
    }
}

export default JwtService;
