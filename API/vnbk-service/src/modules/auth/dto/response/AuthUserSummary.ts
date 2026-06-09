/** The user fields echoed back alongside auth tokens on login / verify. */
export class AuthUserSummary {
	id!: string;
	name?: string | null;
	phone?: string | null;
	email!: string;
	role?: string | null;
}
