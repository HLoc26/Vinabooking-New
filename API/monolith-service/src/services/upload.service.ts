import { EntityType, Image, VariantType } from "@/models/image";
import { ImageRepository } from "@/repositories";
import { CreateOptimized, CreateThumbnail, CreateWEBP, ImageProcessingPipeline } from "@/utils/image-processor";
import { FileType, UploadResult } from "../types/image.types";
import S3Service from "./s3.service";

class UploadService {
	constructor(
		private readonly s3Service: S3Service,
		private readonly imageRepository: ImageRepository
	) { }

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
		image.generateVariantsFromUpload(uploadResult as any);

		// Handle References
		if (entityType === EntityType.USER_PROFILE) {
			await this.imageRepository.clearPrimaryReference(entityType, entityId);
		}

		image.attachToEntity(entityType, entityId);

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
