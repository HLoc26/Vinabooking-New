/**
 * User role. Defined as a const object + string-union type (mirroring the Prisma
 * generated enum exactly) so domain <-> persistence assignment is friction-free,
 * while keeping the domain free of any `@/generated` import.
 */
export const ERole = {
	TRAVELLER: "TRAVELLER",
	ACCOMMODATION_OWNER: "ACCOMMODATION_OWNER",
} as const;

export type ERole = (typeof ERole)[keyof typeof ERole];
