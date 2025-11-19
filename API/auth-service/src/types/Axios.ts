export type CacheInfo = {
	email: string;
	info: {
		cognitoSub: string;
		name: string;
		phone: string;
		userType: "TRAVELLER" | "ACCOMMODATION_OWNER";
	};
};

export type CacheUserResponse = boolean | null;

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
