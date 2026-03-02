export interface AuthTokens {
	accessToken: string;
	idToken: string;
	refreshToken?: string;
	expiresIn: number;
	tokenType: string;
}

export enum ETokenType {
	ACCESS = "access",
	ID = "id",
}
