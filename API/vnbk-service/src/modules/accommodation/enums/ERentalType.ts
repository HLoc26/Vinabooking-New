/**
 * Rental type. Const object + string-union type, mirroring the Prisma generated
 * enum exactly so domain <-> persistence assignment is friction-free, while
 * keeping the domain free of any `@/generated` import.
 */
export const ERentalType = {
	ENTIRE_PLACE: "ENTIRE_PLACE",
	PRIVATE_ROOM: "PRIVATE_ROOM",
	SHARED_ROOM: "SHARED_ROOM",
} as const;

export type ERentalType = (typeof ERentalType)[keyof typeof ERentalType];
