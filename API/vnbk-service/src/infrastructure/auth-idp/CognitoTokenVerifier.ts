import { singleton } from "tsyringe";
import { CognitoJwtVerifier } from "aws-jwt-verify";
import { SimpleJwksCache } from "aws-jwt-verify/jwk";
import type { Fetcher } from "aws-jwt-verify/https";
import { AppConfig } from "@/config/AppConfig";
import type { ITokenVerifier, VerifiedToken } from "@/infrastructure/auth-idp/ITokenVerifier";

/** Fetcher with a bounded timeout, mirroring the monolith's JWKS fetch behavior. */
class TimeoutFetcher implements Fetcher {
	async fetch(uri: string, requestOptions?: Record<string, unknown>, data?: ArrayBuffer): Promise<ArrayBuffer> {
		const controller = new AbortController();
		const timeout = setTimeout(() => controller.abort(), 10000);
		try {
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

type Verifier = ReturnType<typeof CognitoJwtVerifier.create>;

/** Verifies Cognito JWTs. Config + verifier are built lazily on first verify(). */
@singleton()
export class CognitoTokenVerifier implements ITokenVerifier {
	private readonly verifiers = new Map<"access" | "id", Verifier>();

	constructor(private readonly config: AppConfig) {}

	private getVerifier(type: "access" | "id"): Verifier {
		let verifier = this.verifiers.get(type);
		if (!verifier) {
			verifier = CognitoJwtVerifier.create(
				{
					userPoolId: this.config.getRequired("COGNITO_USER_POOL_ID"),
					tokenUse: type,
					clientId: this.config.getRequired("COGNITO_APP_CLIENT_ID"),
					jwksTimeout: 10000,
				},
				{ jwksCache: new SimpleJwksCache({ fetcher: new TimeoutFetcher() }) }
			);
			this.verifiers.set(type, verifier);
		}
		return verifier;
	}

	public async verify(token: string, type: "access" | "id"): Promise<VerifiedToken> {
		const payload = await this.getVerifier(type).verify(token);
		return { sub: payload.sub };
	}
}
