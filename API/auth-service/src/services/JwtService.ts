import { CognitoJwtVerifier } from "aws-jwt-verify";
import CognitoClient from "../clients/CognitoIdentityProviderClient";
import { SimpleJwksCache } from "aws-jwt-verify/jwk";
import { SimpleFetcher } from "aws-jwt-verify/https";

class JwtService {
	public static async verifyToken(token: string, type: "id" | "access") {
		const verifier = CognitoJwtVerifier.create(
			{
				userPoolId: CognitoClient.userPoolId,
				tokenUse: type,
				clientId: CognitoClient.clientId,
			},
			{
				jwksCache: new SimpleJwksCache({
					fetcher: new SimpleFetcher({
						defaultRequestOptions: {
							responseTimeout: 10000,
						},
					}),
				}),
			}
		);
		const payload = await verifier.verify(token);
		return payload;
	}

	/**
	 * @deprecated
	 */
	public static async verifyAccessToken(token: string) {
		const verifier = CognitoJwtVerifier.create({
			userPoolId: CognitoClient.userPoolId,
			tokenUse: "access",
			clientId: CognitoClient.clientId,
		});
		const payload = await verifier.verify(token);
		return payload;
	}

	/**
	 * @deprecated
	 */
	public static async verifyIdToken(token: string) {
		const verifier = CognitoJwtVerifier.create({
			userPoolId: CognitoClient.userPoolId,
			tokenUse: "id",
			clientId: CognitoClient.clientId,
		});
		const payload = await verifier.verify(token);
		return payload;
	}

	public static parseJwt(token: string) {
		return JSON.parse(Buffer.from(token.split(".")[1], "base64").toString());
	}
}

export default JwtService;
