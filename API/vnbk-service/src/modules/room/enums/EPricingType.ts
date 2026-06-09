/**
 * Room pricing model. Const object + string-union type, mirroring the Prisma
 * generated enum exactly so domain <-> persistence assignment is friction-free,
 * while keeping the domain free of any `@/generated` import.
 */
export const EPricingType = {
	PER_NIGHT: "PER_NIGHT",
	PER_PERSON_PER_NIGHT: "PER_PERSON_PER_NIGHT",
	PER_HOUR: "PER_HOUR",
	CUSTOM: "CUSTOM",
} as const;

export type EPricingType = (typeof EPricingType)[keyof typeof EPricingType];
