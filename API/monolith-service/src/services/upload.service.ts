import ImageRepository from "@/repositories/image.repository";
import { FileType, UploadResult } from "../types/image.types";
import { CreateOptimized, CreateThumbnail, CreateWEBP, ImageProcessingPipeline } from "@/utils/image-processor";
import S3Service from "./s3.service";
import { EntityType, Image, ImageReference, ImageVariant, VariantType } from "../models/image";

class UploadService {
	constructor(
		private readonly s3Service: S3Service,
		private readonly imageRepository: ImageRepository
	) {}

	private async processAndUpload(
		entityId: string,
		entityType: EntityType,
		original: FileType,
		uploadFn: (id: string, files: Map<string, Buffer>, mime: string) => Promise<UploadResult>,
	): Promise<Image> {
		if (!original?.buffer) throw new Error("Invalid file buffer");

		const processed = await new ImageProcessingPipeline().addStep(new CreateThumbnail()).addStep(new CreateWEBP()).addStep(new CreateOptimized()).execute(original.buffer);

		// The legacy uploadFn seems to expect the keys to be EVariantType, which are identical to VariantType.
		const uploadResult = await uploadFn(entityId, processed as any, original.mimetype);
		
		// Build Domain Model
		const s3Key = uploadResult.get(VariantType.ORIGINAL)?.get("s3Key");
		if (!s3Key) throw new Error("Missing original image s3Key");

		const image = Image.builder()
			.setS3Key(s3Key)
			.setFilename(s3Key)
			.setContentType(original.mimetype)
			.setSize(BigInt(original.size))
			.build();

		// Add Variants
		for (const variant of Object.values(VariantType)) {
			if (variant === VariantType.ORIGINAL) {
				const v = ImageVariant.builder()
					.setImageId(image.getId())
					.setS3Key(s3Key)
					.setVariant(variant)
					.build();
				image.addVariant(v);
				continue;
			}

			const data = uploadResult.get(variant);
			if (data) {
				const v = ImageVariant.builder()
					.setImageId(image.getId())
					.setS3Key(data.get("s3Key")!)
					.setVariant(variant)
					.build();
				image.addVariant(v);
			}
		}

		// Handle References
		if (entityType === EntityType.USER_PROFILE) {
			await this.imageRepository.clearPrimaryReference(entityType, entityId);
		}

		const reference = ImageReference.builder()
			.setImageId(image.getId())
			.setEntityType(entityType)
			.setEntityId(entityId)
			.setIsPrimary(entityType === EntityType.USER_PROFILE)
			.build();
			
		image.addReference(reference);

		// Persist the pure domain model
		await this.imageRepository.save(image);

		return image;
	}

	/**
	 * Gộp xử lý upload cho tất cả entity
	 * @param entityType loại entity (USER_PROFILE, ACCOMMODATION, ROOM, REVIEW)
	 * @param entityId id entity
	 * @param files danh sách file upload
	 */
	async handleUploadByEntity(entityType: EntityType, entityId: string, files: FileType[]): Promise<Image[]> {
		if (!files?.length) throw new Error("Empty files");

		const uploadFn = this.s3Service.uploadEntityImages.bind(this.s3Service, entityType as any);

		const tasks =
			entityType === EntityType.USER_PROFILE
				? [this.processAndUpload(entityId, entityType, files[0], uploadFn)] // Single upload for profile image
				: files.map((file) => this.processAndUpload(entityId, entityType, file, uploadFn)); // Multiple upload for other type

		const results = await Promise.all(tasks);
		return results;
	}
}
export default UploadService;
