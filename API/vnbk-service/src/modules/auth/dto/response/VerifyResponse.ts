/** Decoded subject + role echoed back by the verify-token endpoint. */
export class VerifyResponse {
	user!: {
		id: string;
		username: string;
		role?: string | null;
	};
}
