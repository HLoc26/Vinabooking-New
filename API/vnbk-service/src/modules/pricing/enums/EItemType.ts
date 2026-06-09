/**
 * Bookable item type. Defined as a const object + string-union type (mirroring
 * the Prisma generated enum exactly) so domain <-> persistence assignment is
 * friction-free, while keeping the domain free of any `@/generated` import.
 */
export const EItemType = {
	ROOM: "ROOM",
	BED: "BED",
} as const;

export type EItemType = (typeof EItemType)[keyof typeof EItemType];
