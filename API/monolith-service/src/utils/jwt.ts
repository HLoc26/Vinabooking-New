import { CognitoJwtVerifier } from "aws-jwt-verify";
import CognitoClient from "@/clients/cognito.client";
import { SimpleJwksCache } from "aws-jwt-verify/jwk";
import { Fetcher } from "aws-jwt-verify/https";
import { CognitoJwtPayload } from "aws-jwt-verify/jwt-model";

class JwtFetcher implements Fetcher {
	async fetch(uri: string, requestOptions?: Record<string, unknown>, data?: ArrayBuffer) {
		const controller = new AbortController();
		const timeout = setTimeout(() => controller.abort(), 10000);

		try {
			// safe cast to RequestInit
			const options: RequestInit = {
				...(requestOptions as RequestInit),
				body: data,
				signal: controller.signal,
			};

			const res = await fetch(uri, options);
			return await res.arrayBuffer();
		} finally {
			clearTimeout(timeout);
		}
	}
}

class JwtService {
	public static async verifyToken(token: string, type: "id" | "access"): Promise<CognitoJwtPayload> {
		const verifier = CognitoJwtVerifier.create(
			{
				userPoolId: CognitoClient.userPoolId,
				tokenUse: type,
				clientId: CognitoClient.appClientId,
				jwksTimeout: 10000, // tăng timeout từ 3000ms mặc định
			},
			{ jwksCache: new SimpleJwksCache({ fetcher: new JwtFetcher() }) }
		);
		const payload = await verifier.verify(token);
		return payload;
	}

	public static parseJwt(token: string) {
		return JSON.parse(Buffer.from(token.split(".")[1], "base64").toString());
	}
}

export default JwtService;
