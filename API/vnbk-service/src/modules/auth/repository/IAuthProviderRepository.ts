import type { AuthProvider } from "@/modules/auth/domain/AuthProvider";

/** Domain-facing persistence port for user auth-provider links. */
export interface IAuthProviderRepository {
	/** Persist a new provider link for a user. */
	create(provider: AuthProvider): Promise<AuthProvider>;
	/** All provider links registered for the given email. */
	findByEmail(email: string): Promise<AuthProvider[]>;
}
