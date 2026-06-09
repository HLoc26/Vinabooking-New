import { ImageVariantResponse } from "@/modules/image/dto/response/ImageVariantResponse";

/** A single image reference, used to indicate which entity an image belongs to. */
export class ImageReferenceResponse {
	entityId!: string;
	isPrimary!: boolean;
}

/**
 * Wire representation of an image plus its variants — the public, JSON-safe shape
 * other modules (accommodation, room) embed in their own responses. Mirrors the
 * monolith `ImageFullInfo`: `size` is stringified (BigInt-safe) and full S3 URLs
 * are attached to the original and every variant.
 */
export class ImageResponse {
	id!: string;
	s3Key!: string;
	filename!: string;
	contentType!: string;
	size!: string;
	createdAt?: Date;
	url!: string;
	variants!: ImageVariantResponse[];
	references!: ImageReferenceResponse[];
}
