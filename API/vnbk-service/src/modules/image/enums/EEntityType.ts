/**
 * The kind of entity an image is attached to. Defined as a const object + string-union
 * type (mirroring the Prisma generated enum exactly) so domain <-> persistence assignment
 * is friction-free, while keeping the domain free of any `@/generated` import.
 */
export const EEntityType = {
	ACCOMMODATION: "ACCOMMODATION",
	USER_PROFILE: "USER_PROFILE",
	ROOM: "ROOM",
	REVIEW: "REVIEW",
} as const;

export type EEntityType = (typeof EEntityType)[keyof typeof EEntityType];
