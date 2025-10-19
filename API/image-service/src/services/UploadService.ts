import BadRequestError from "../errors/BadRequestError";
import ImageRepository from "../repositories/ImageRepository";
import { FileType, UploadedImage, UploadResult } from "../types/Image";
import { CreateOptimized, CreateThumbnail, CreateWEBP, ImageProcessingPipeline } from "../utils/ImageProcessor";
import S3Service from "./S3Service";
import { EEntityType, EVariantType } from "../../generated/prisma/index.js";

import { EEntityType as GRPC_EEntityType } from "../../generated/grpc/image-service/image-service";
import MappingUtil from "../utils/MappingUtil";

export class UploadService {
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
        if (!original?.buffer) throw new BadRequestError("Invalid file buffer");

        const processed = await new ImageProcessingPipeline()
            .addStep(new CreateThumbnail())
            .addStep(new CreateWEBP())
            .addStep(new CreateOptimized())
            .execute(original.buffer);

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
    async handleUploadByEntity(entityType: EEntityType | GRPC_EEntityType, entityId: string, files: FileType[]): Promise<UploadedImage[]> {
        if (!files?.length) throw new BadRequestError("Empty files");

        const type = MappingUtil.entityTypeMapping(entityType);

        const uploadFn = this.s3Service.uploadEntityImages.bind(this.s3Service, type);
        const saveFn = this.imageRepository.saveEntityImage.bind(this.imageRepository, type);

        const tasks =
            type === EEntityType.USER_PROFILE
                ? [this.processAndUpload(entityId, files[0], uploadFn, saveFn)] // Single upload for profile image
                : files.map((file) => this.processAndUpload(entityId, file, uploadFn, saveFn)); // Multiple upload for other type

        const results = await Promise.all(tasks);
        return results.flat();
    }
}
