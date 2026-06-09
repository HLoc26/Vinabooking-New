/** The token bundle returned by a Cognito authentication flow. */
export interface AuthTokens {
	accessToken: string;
	idToken: string;
	refreshToken?: string;
	expiresIn: number;
	tokenType: string;
}
