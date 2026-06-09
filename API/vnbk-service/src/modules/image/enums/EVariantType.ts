/**
 * A processed rendition of an image. Defined as a const object + string-union type
 * (mirroring the Prisma generated enum exactly) so domain <-> persistence assignment
 * is friction-free, while keeping the domain free of any `@/generated` import.
 */
export const EVariantType = {
	ORIGINAL: "ORIGINAL",
	THUMBNAIL: "THUMBNAIL",
	WEBP: "WEBP",
	OPTIMIZED: "OPTIMIZED",
} as const;

export type EVariantType = (typeof EVariantType)[keyof typeof EVariantType];
