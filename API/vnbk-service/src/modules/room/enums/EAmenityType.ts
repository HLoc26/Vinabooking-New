/**
 * Amenity category. Const object + string-union type, mirroring the Prisma
 * generated enum exactly so domain <-> persistence assignment is friction-free,
 * while keeping the domain free of any `@/generated` import.
 */
export const EAmenityType = {
	COMFORT: "COMFORT",
	ENTERTAINMENT: "ENTERTAINMENT",
	BATHROOM: "BATHROOM",
	KITCHEN: "KITCHEN",
	SAFETY: "SAFETY",
	ACCESSIBILITY: "ACCESSIBILITY",
	WORKSPACE: "WORKSPACE",
	OUTDOOR: "OUTDOOR",
	OTHER: "OTHER",
} as const;

export type EAmenityType = (typeof EAmenityType)[keyof typeof EAmenityType];
