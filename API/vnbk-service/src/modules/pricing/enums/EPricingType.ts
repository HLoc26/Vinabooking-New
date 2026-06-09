/**
 * Room pricing model. Const object + string-union type, mirroring the Prisma
 * generated enum exactly (keeps the domain free of any `@/generated` import).
 * Only `PER_NIGHT` runs through the dynamic pricing engine; the rest fall back
 * to static per-night math (spec §1.2).
 */
export const EPricingType = {
	PER_NIGHT: "PER_NIGHT",
	PER_PERSON_PER_NIGHT: "PER_PERSON_PER_NIGHT",
	PER_HOUR: "PER_HOUR",
	CUSTOM: "CUSTOM",
} as const;

export type EPricingType = (typeof EPricingType)[keyof typeof EPricingType];
