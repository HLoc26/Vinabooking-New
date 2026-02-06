import ImageRepository from "@/repositories/image.repository";
import { FileType, UploadedImage, UploadResult } from "../types/image.types";
import { CreateOptimized, CreateThumbnail, CreateWEBP, ImageProcessingPipeline } from "@/utils/image-processor";
import S3Service from "./s3.service";
import { EEntityType, EVariantType } from "@/generated/enums";

class UploadService {
	constructor(
		private readonly s3Service: S3Service,
		private readonly imageRepository: ImageRepository
	) {}

	private async processAndUpload(
		entityId: string,
		original: FileType,
		uploadFn: (id: string, files: Map<EVariantType, Buffer>, mime: string) => Promise<UploadResult>,
		saveFn: (id: string, uploaded: UploadResult, original: FileType) => Promise<UploadedImage[]>
	): Promise<UploadedImage[]> {
		if (!original?.buffer) throw new Error("Invalid file buffer");

		const processed = await new ImageProcessingPipeline().addStep(new CreateThumbnail()).addStep(new CreateWEBP()).addStep(new CreateOptimized()).execute(original.buffer);

		const uploadResult = await uploadFn(entityId, processed, original.mimetype);
		const saved = await saveFn(entityId, uploadResult, original);
		return saved;
	}

	/**
	 * Gộp xử lý upload cho tất cả entity
	 * @param entityType loại entity (USER_PROFILE, ACCOMMODATION, ROOM, REVIEW)
	 * @param entityId id entity
	 * @param files danh sách file upload
	 */
	async handleUploadByEntity(entityType: EEntityType, entityId: string, files: FileType[]): Promise<UploadedImage[]> {
		if (!files?.length) throw new Error("Empty files");

		const uploadFn = this.s3Service.uploadEntityImages.bind(this.s3Service, entityType);
		const saveFn = this.imageRepository.saveEntityImage.bind(this.imageRepository, entityType);

		const tasks =
			entityType === EEntityType.USER_PROFILE
				? [this.processAndUpload(entityId, files[0], uploadFn, saveFn)] // Single upload for profile image
				: files.map((file) => this.processAndUpload(entityId, file, uploadFn, saveFn)); // Multiple upload for other type

		const results = await Promise.all(tasks);
		return results.flat();
	}
}
export default UploadService;
