export interface CognitoIdToken {
	sub: string;
	email: string;
	name: string;
	phone_number?: string;
	"custom:userType"?: string;
	exp: number;
	iss: string;
}
