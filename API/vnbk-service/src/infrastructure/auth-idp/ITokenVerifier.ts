/** The verified subject extracted from a bearer token. */
export interface VerifiedToken {
	sub: string;
}

/** Port for verifying identity-provider (Cognito) JWTs. */
export interface ITokenVerifier {
	verify(token: string, type: "access" | "id"): Promise<VerifiedToken>;
}
