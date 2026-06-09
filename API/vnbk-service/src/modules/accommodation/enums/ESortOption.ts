/**
 * Search sort options. A TS-only enum (no Prisma counterpart) ported from the
 * monolith's `accommodation.types.ts`. Defined as a const object + string-union
 * type for consistency with the other module enums; the string values match the
 * query-string tokens the search endpoint accepts.
 */
export const ESortOption = {
	NEWEST: "newest",
	NAME_ASC: "name_asc",
	NAME_DESC: "name_desc",
	PRICE_ASC: "price_asc",
	PRICE_DESC: "price_desc",
	RECOMMENDED: "recommended",
	RATING: "rating",
} as const;

export type ESortOption = (typeof ESortOption)[keyof typeof ESortOption];
