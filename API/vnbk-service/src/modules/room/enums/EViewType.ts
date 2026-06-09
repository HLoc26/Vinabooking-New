/**
 * Room view type. Const object + string-union type, mirroring the Prisma
 * generated enum exactly so domain <-> persistence assignment is friction-free,
 * while keeping the domain free of any `@/generated` import.
 */
export const EViewType = {
	SEA: "SEA",
	OCEAN: "OCEAN",
	RIVER: "RIVER",
	LAKE: "LAKE",
	CITY: "CITY",
	GARDEN: "GARDEN",
	MOUNTAIN: "MOUNTAIN",
	POOL: "POOL",
	STREET: "STREET",
	COURTYARD: "COURTYARD",
	LANDMARK: "LANDMARK",
	PARTIAL_SEA: "PARTIAL_SEA",
	PARTIAL_CITY: "PARTIAL_CITY",
	NONE: "NONE",
	OTHER: "OTHER",
} as const;

export type EViewType = (typeof EViewType)[keyof typeof EViewType];
