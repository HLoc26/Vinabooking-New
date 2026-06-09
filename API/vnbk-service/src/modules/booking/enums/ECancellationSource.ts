/**
 * Who cancelled a booking. Defined as a const object + string-union type
 * (mirroring the Prisma generated enum exactly) so domain <-> persistence
 * assignment is friction-free, while keeping the domain free of any
 * `@/generated` import.
 */
export const ECancellationSource = {
	OWNER: "OWNER",
	TRAVELLER: "TRAVELLER",
	SYSTEM: "SYSTEM",
} as const;

export type ECancellationSource = (typeof ECancellationSource)[keyof typeof ECancellationSource];
