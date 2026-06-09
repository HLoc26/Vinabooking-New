import { injectable } from "tsyringe";

/**
 * Decodes a JWT payload WITHOUT verifying its signature. Ports the monolith's
 * `JwtService.parseJwt` — used only to read claims (sub/email/name) from a token
 * that has already been issued by Cognito/Google. Signature verification of
 * incoming bearer tokens is handled separately by the ITokenVerifier.
 */
@injectable()
export class JwtDecoder {
	public decode<T = Record<string, unknown>>(token: string): T {
		const payload = token.split(".")[1];
		return JSON.parse(Buffer.from(payload, "base64").toString()) as T;
	}
}
