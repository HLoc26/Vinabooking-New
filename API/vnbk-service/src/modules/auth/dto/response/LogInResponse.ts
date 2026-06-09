import { AuthUserSummary } from "@/modules/auth/dto/response/AuthUserSummary";

/** Tokens + user summary returned by a successful login. */
export class LogInResponse {
	accessToken!: string;
	idToken!: string;
	refreshToken?: string;
	expiresIn!: number;
	tokenType!: string;
	user!: AuthUserSummary;
}
