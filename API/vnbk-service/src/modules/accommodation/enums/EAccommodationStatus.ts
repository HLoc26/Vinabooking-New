/**
 * Accommodation lifecycle status. Const object + string-union type, mirroring the
 * Prisma generated enum exactly so domain <-> persistence assignment is
 * friction-free, while keeping the domain free of any `@/generated` import.
 */
export const EAccommodationStatus = {
	DRAFT: "DRAFT",
	PUBLISHED: "PUBLISHED",
	HIDDEN: "HIDDEN",
	BANNED: "BANNED",
} as const;

export type EAccommodationStatus = (typeof EAccommodationStatus)[keyof typeof EAccommodationStatus];
