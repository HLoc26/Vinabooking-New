/** Fresh tokens returned by the refresh-token flow. */
export class RefreshResponse {
	accessToken!: string;
	idToken!: string;
	refreshToken?: string;
	expiresIn!: number;
	tokenType!: string;
}
