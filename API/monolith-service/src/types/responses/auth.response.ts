export interface ApiResponse<T = unknown> {
	success: boolean;
	data?: T;
	message?: string | null;
}

export interface ConfirmForgotPasswordResponse {
	success: boolean;
}

export interface ConfirmUserResponse {
	success: boolean;
}

export interface GetOTPResponse {
	CodeDeliveryDestination?: string;
	CodeDeliveryMedium?: string;
}

export type ForgotPasswordResponse = GetOTPResponse;

export interface GoogleOAuthResponse {
	iss: string;
	azp: string;
	aud: string;
	sub: string;
	email: string;
	email_verified: boolean;
	at_hash: string;
	name: string;
	picture: string;
	given_name: string;
	family_name: string;
	iat: number;
	exp: number;
}

export interface LogInResponse {
	accessToken: string;
	idToken: string;
	refreshToken?: string;
	expiresIn: number;
	tokenType: string;
	user: {
		id: string;
		name?: string | null;
		phone?: string | null;
		email: string;
	};
}

export interface RefreshResponse {
	accessToken: string;
	idToken: string;
	refreshToken?: string;
	expiresIn: number;
	tokenType: string;
}

export interface SignOutResponse {
	success: boolean;
}

export interface SignUpResponse {
	userSub: string;
	destination?: string; // CodeDeliveryDestination
	deliveryMedium?: string; // CodeDeliveryMedium
}

export interface VerifyResponse {
	user: {
		id: string;
		username: string;
	};
}
