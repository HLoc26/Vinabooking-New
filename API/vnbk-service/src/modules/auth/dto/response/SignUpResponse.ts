/** Result of a Cognito sign-up: the new user sub + OTP delivery details. */
export class SignUpResponse {
	userSub!: string;
	destination?: string;
	deliveryMedium?: string;
}
