/**
 * Facility category. Const object + string-union type, mirroring the Prisma
 * generated enum exactly so domain <-> persistence assignment is friction-free,
 * while keeping the domain free of any `@/generated` import.
 */
export const EFacilityType = {
	GENERAL: "GENERAL",
	FOOD_AND_DRINK: "FOOD_AND_DRINK",
	PUBLIC_FACILITIES: "PUBLIC_FACILITIES",
	SERVICES: "SERVICES",
	SAFETY: "SAFETY",
	ACCESSIBILITY: "ACCESSIBILITY",
	ENTERTAINMENT: "ENTERTAINMENT",
	OUTDOOR: "OUTDOOR",
	TRANSPORTATION: "TRANSPORTATION",
	WELLNESS: "WELLNESS",
	SPECIAL_AMENITIES: "SPECIAL_AMENITIES",
	SUSTAINABILITY: "SUSTAINABILITY",
	OTHER: "OTHER",
} as const;

export type EFacilityType = (typeof EFacilityType)[keyof typeof EFacilityType];
