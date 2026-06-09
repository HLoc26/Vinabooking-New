/**
 * Bed type. Const object + string-union type, mirroring the Prisma generated
 * enum exactly so domain <-> persistence assignment is friction-free, while
 * keeping the domain free of any `@/generated` import.
 */
export const EBedType = {
	SINGLE: "SINGLE",
	DOUBLE: "DOUBLE",
	QUEEN: "QUEEN",
	KING: "KING",
	SUPER_KING: "SUPER_KING",
	TWIN: "TWIN",
	SOFA_BED: "SOFA_BED",
	BUNK_BED: "BUNK_BED",
	FUTON: "FUTON",
	MURPHY_BED: "MURPHY_BED",
	OTHER: "OTHER",
} as const;

export type EBedType = (typeof EBedType)[keyof typeof EBedType];
