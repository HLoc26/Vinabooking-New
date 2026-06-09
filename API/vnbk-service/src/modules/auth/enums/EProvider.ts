/**
 * Authentication provider for a user account. Defined as a const object +
 * string-union type (mirroring the Prisma generated `EProvider` enum exactly) so
 * domain <-> persistence assignment is friction-free, while keeping the domain
 * free of any `@/generated` import.
 */
export const EProvider = {
	Credentials: "Credentials",
	Google: "Google",
} as const;

export type EProvider = (typeof EProvider)[keyof typeof EProvider];
