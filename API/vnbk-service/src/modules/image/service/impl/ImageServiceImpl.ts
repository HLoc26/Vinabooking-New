import { inject, injectable } from "tsyringe";
import { v4 as uuidv4 } from "uuid";
import { OBJECT_STORAGE } from "@/infrastructure/infrastructure.tokens";
import type { IObjectStorage } from "@/infrastructure/storage/IObjectStorage";
import { IMAGE_REPOSITORY, IMAGE_PROCESSOR } from "@/modules/image/image.tokens";
import type { IImageRepository } from "@/modules/image/repository/IImageRepository";
import type { IImageProcessor } from "@/modules/image/service/IImageProcessor";
import type { IImageService, EntityImagesMap } from "@/modules/image/service/IImageService";
import type { UploadResult, UploadFile, UploadedVariant } from "@/modules/image/service/ProcessedImage";
import { EEntityType } from "@/modules/image/enums/EEntityType";
import { EVariantType } from "@/modules/image/enums/EVariantType";
import { ImageDtoMapper } from "@/modules/image/rest/mapper/ImageDtoMapper";
import type { ImageResponse } from "@/modules/image/dto/response/ImageResponse";
import type { UploadedImageResponse } from "@/modules/image/dto/response/UploadedImageResponse";
import { BadRequestError } from "@/shared/error/BadRequestError";

const MIME_TO_EXTENSION: Record<string, string> = {
	"image/jpeg": "jpg",
	"image/png": "png",
	"image/webp": "webp",
};

/**
 * Orchestrates image retrieval, upload (process -> S3 -> persist) and deletion.
 * The entity/variant key logic that lived in the monolith `S3Service` lives here;
 * the low-level put/delete/url is delegated to IObjectStorage.
 */
@injectable()
export class ImageServiceImpl implements IImageService {
	constructor(
		@inject(IMAGE_REPOSITORY) private readonly imageRepository: IImageRepository,
		@inject(IMAGE_PROCESSOR) private readonly processor: IImageProcessor,
		@inject(OBJECT_STORAGE) private readonly storage: IObjectStorage,
		private readonly mapper: ImageDtoMapper
	) {}

	public async getImagesByEntity(entityType: EEntityType, entityId: string): Promise<ImageResponse[]> {
		const images = await this.imageRepository.getEntityImageBatch(entityType, [entityId]);
		return this.mapper.toResponseList(images);
	}

	public async getImagesByEntities(entityType: EEntityType, entityIds: string[]): Promise<EntityImagesMap> {
		const grouped: EntityImagesMap = {};
		if (entityIds.length === 0) return grouped;

		const images = await this.imageRepository.getEntityImageBatch(entityType, entityIds);
		for (const image of images) {
			const responses = this.mapper.toResponse(image);
			// An image belongs to the entity named by its (first) reference.
			const entityId = image.entityId;
			if (!entityId) continue;
			if (!grouped[entityId]) grouped[entityId] = [];
			grouped[entityId].push(responses);
		}
		return grouped;
	}

	public async uploadForEntity(entityType: EEntityType, entityId: string, files: UploadFile[]): Promise<UploadedImageResponse[]> {
		if (!files?.length) throw new BadRequestError("Empty files");

		// A profile is a single image; every other entity may receive many.
		const targets = entityType === EEntityType.USER_PROFILE ? [files[0]] : files;

		const tasks = targets.map((file) => this.processUploadAndSave(entityType, entityId, file));
		const saved = await Promise.all(tasks);
		return this.mapper.toUploadedResponseList(saved.flat());
	}

	public async deleteImage(imageId: string): Promise<void> {
		const keys = await this.imageRepository.deleteImage(imageId);
		if (keys.length > 0) {
			await this.storage.deleteObjects(keys);
		}
	}

	public async deleteImagesByEntity(entityType: EEntityType, entityId: string): Promise<void> {
		const keys = await this.imageRepository.deleteEntityImages(entityType, entityId);
		if (keys.length > 0) {
			await this.storage.deleteObjects(keys);
		}
	}

	/** Process one file into variants, upload each to S3, then persist the image record. */
	private async processUploadAndSave(entityType: EEntityType, entityId: string, file: UploadFile) {
		if (!file?.buffer) throw new BadRequestError("Invalid file buffer");

		const processed = await this.processor.process(file.buffer);
		const uploaded = await this.uploadVariants(entityType, entityId, processed, file.mimetype);

		return this.imageRepository.saveEntityImage({
			entityType,
			entityId,
			uploaded,
			filename: uploaded.get(EVariantType.ORIGINAL)?.s3Key ?? "",
			contentType: file.mimetype,
			size: file.size,
		});
	}

	/** Upload every processed variant under `{entityType}/{entityId}/...` and collect their keys. */
	private async uploadVariants(entityType: EEntityType, entityId: string, processed: Map<EVariantType, Buffer>, originalMimeType: string): Promise<UploadResult> {
		const baseKey = `${entityType}/${entityId}`;

		const entries: [EVariantType, UploadedVariant][] = await Promise.all(
			Array.from(processed.entries()).map(async ([variant, buffer]) => {
				const mimeType = this.detectMimeType(variant, originalMimeType);
				const uploaded = await this.uploadVariant(baseKey, buffer, variant, mimeType);
				return [variant, uploaded] as [EVariantType, UploadedVariant];
			})
		);

		return new Map(entries);
	}

	/** Build a unique key for one variant and put it in object storage. */
	private async uploadVariant(baseKey: string, buffer: Buffer, variant: EVariantType, mimeType: string): Promise<UploadedVariant> {
		const id = uuidv4();
		const ext = MIME_TO_EXTENSION[mimeType] ?? "jpg";
		const key = `${baseKey}/${id}-${variant.toLowerCase()}.${ext}`;
		await this.storage.putObject(key, buffer, mimeType);
		return { id, s3Key: key };
	}

	/** WebP/thumbnail/optimized renditions have a fixed mime; original keeps its own. */
	private detectMimeType(variant: EVariantType, originalMimeType: string): string {
		switch (variant) {
			case EVariantType.WEBP:
				return "image/webp";
			case EVariantType.THUMBNAIL:
			case EVariantType.OPTIMIZED:
				return "image/jpeg";
			default:
				return originalMimeType;
		}
	}
}
