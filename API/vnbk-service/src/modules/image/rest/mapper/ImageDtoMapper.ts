import { inject, injectable } from "tsyringe";
import { OBJECT_STORAGE } from "@/infrastructure/infrastructure.tokens";
import type { IObjectStorage } from "@/infrastructure/storage/IObjectStorage";
import type { Image } from "@/modules/image/domain/Image";
import { ImageResponse, ImageReferenceResponse } from "@/modules/image/dto/response/ImageResponse";
import { ImageVariantResponse } from "@/modules/image/dto/response/ImageVariantResponse";
import type { UploadedVariantRecord } from "@/modules/image/repository/UploadedVariantRecord";
import { UploadedImageResponse } from "@/modules/image/dto/response/UploadedImageResponse";

/**
 * Maps Image domain models to wire DTOs, attaching public S3 URLs and converting
 * BigInt sizes to strings (JSON-safe). Mirrors the monolith `_sanitizeImage`.
 */
@injectable()
export class ImageDtoMapper {
	constructor(@inject(OBJECT_STORAGE) private readonly storage: IObjectStorage) {}

	public toResponse(image: Image): ImageResponse {
		const response = new ImageResponse();
		response.id = image.id;
		response.s3Key = image.s3Key;
		response.filename = image.filename;
		response.contentType = image.contentType;
		response.size = image.size.toString();
		response.createdAt = image.createdAt;
		response.url = this.storage.getPublicUrl(image.s3Key);
		response.variants = image.variants.map((v) => {
			const variant = new ImageVariantResponse();
			variant.id = v.id;
			variant.variant = v.variant;
			variant.s3Key = v.s3Key;
			variant.url = this.storage.getPublicUrl(v.s3Key);
			return variant;
		});
		response.references = image.references.map((r) => {
			const reference = new ImageReferenceResponse();
			reference.entityId = r.entityId;
			reference.isPrimary = r.isPrimary;
			return reference;
		});
		return response;
	}

	public toResponseList(images: Image[]): ImageResponse[] {
		return images.map((image) => this.toResponse(image));
	}

	public toUploadedResponse(record: UploadedVariantRecord): UploadedImageResponse {
		const response = new UploadedImageResponse();
		response.id = record.id;
		response.s3Key = record.s3Key;
		response.variant = record.variant;
		return response;
	}

	public toUploadedResponseList(records: UploadedVariantRecord[]): UploadedImageResponse[] {
		return records.map((record) => this.toUploadedResponse(record));
	}
}
