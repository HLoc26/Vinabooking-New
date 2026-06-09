/** OTP delivery details returned by resend-OTP and forgot-password flows. */
export class GetOtpResponse {
	codeDeliveryDestination?: string;
	codeDeliveryMedium?: string;
}
