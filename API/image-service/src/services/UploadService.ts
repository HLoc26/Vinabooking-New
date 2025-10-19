import BadRequestError from "../errors/BadRequestError";
import ImageRepository from "../repositories/ImageRepository";
import { FileType, UploadResult } from "../types/Image";
import { CreateOptimized, CreateThumbnail, CreateWEBP, ImageProcessingPipeline } from "../utils/ImageProcessor";
import S3Service from "./S3Service";
import { EEntityType, EVariantType, Image } from "../../generated/prisma/index.js";

import { EEntityType as GRPC_EEntityType } from "../../generated/grpc/image-service/image-service";

export class UploadService {
    constructor(
        private readonly s3Service: S3Service,
        private readonly imageRepository: ImageRepository
    ) {}

    private async processAndUpload(
        entityId: string,
        original: FileType,
        uploadFn: (id: string, files: Map<EVariantType, Buffer>, mime: string) => Promise<UploadResult>,
        saveFn: (id: string, uploaded: UploadResult, original: FileType) => Promise<Image>
    ) {
        if (!original?.buffer) throw new BadRequestError("Invalid file buffer");

        const processed = await new ImageProcessingPipeline()
            .addStep(new CreateThumbnail())
            .addStep(new CreateWEBP())
            .addStep(new CreateOptimized())
            .execute(original.buffer);

        const uploadResult = await uploadFn(entityId, processed, original.mimetype);
        const saved = await saveFn(entityId, uploadResult, original);
        return Boolean(saved?.id && saved?.s3Key);
    }

    /**
     * Gộp xử lý upload cho tất cả entity
     * @param entityType loại entity (USER_PROFILE, ACCOMMODATION, ROOM, REVIEW)
     * @param entityId id entity
     * @param files danh sách file upload
     */
    async handleUploadByEntity(entityType: EEntityType | GRPC_EEntityType, entityId: string, files: FileType[]) {
        if (!files?.length) throw new BadRequestError("Empty files");

        switch (entityType) {
            case EEntityType.USER_PROFILE:
            case GRPC_EEntityType.USER_PROFILE:
                // User chỉ upload 1 file
                return this.processAndUpload(
                    entityId,
                    files[0],
                    this.s3Service.uploadProfileImage.bind(this.s3Service),
                    this.imageRepository.saveProfileImage.bind(this.imageRepository)
                );

            case EEntityType.ACCOMMODATION:
            case GRPC_EEntityType.ACCOMMODATION:
                await Promise.all(
                    files.map((file) =>
                        this.processAndUpload(
                            entityId,
                            file,
                            this.s3Service.uploadAccommodationImages.bind(this.s3Service),
                            this.imageRepository.saveEntityImage.bind(this.imageRepository, EEntityType.ACCOMMODATION)
                        )
                    )
                );
                return true;

            case EEntityType.ROOM:
            case GRPC_EEntityType.ROOM:
                await Promise.all(
                    files.map((file) =>
                        this.processAndUpload(
                            entityId,
                            file,
                            this.s3Service.uploadRoomImages.bind(this.s3Service),
                            this.imageRepository.saveEntityImage.bind(this.imageRepository, EEntityType.ROOM)
                        )
                    )
                );
                return true;

            case EEntityType.REVIEW:
            case GRPC_EEntityType.REVIEW:
                await Promise.all(
                    files.map((file) =>
                        this.processAndUpload(
                            entityId,
                            file,
                            this.s3Service.uploadReviewImages.bind(this.s3Service),
                            this.imageRepository.saveEntityImage.bind(this.imageRepository, EEntityType.REVIEW)
                        )
                    )
                );
                return true;

            default:
                console.log(entityType, GRPC_EEntityType.ACCOMMODATION);
                throw new BadRequestError("Unsupported entity type");
        }
    }

    async handleUserProfileUpload(userId: string, original: FileType) {
        return this.processAndUpload(
            userId,
            original,
            this.s3Service.uploadProfileImage.bind(this.s3Service),
            this.imageRepository.saveProfileImage.bind(this.imageRepository)
        );
    }

    async handleAccommodationUpload(accommodationId: string, originals: FileType[]) {
        await Promise.all(
            originals.map((file) =>
                this.processAndUpload(
                    accommodationId,
                    file,
                    this.s3Service.uploadAccommodationImages.bind(this.s3Service),
                    this.imageRepository.saveEntityImage.bind(this.imageRepository, EEntityType.ACCOMMODATION)
                )
            )
        );
        return true;
    }

    async handleRoomUpload(roomId: string, originals: FileType[]) {
        await Promise.all(
            originals.map((file) =>
                this.processAndUpload(
                    roomId,
                    file,
                    this.s3Service.uploadRoomImages.bind(this.s3Service),
                    this.imageRepository.saveEntityImage.bind(this.imageRepository, EEntityType.ROOM)
                )
            )
        );
        return true;
    }

    async handleReviewUpload(reviewId: string, originals: FileType[]) {
        await Promise.all(
            originals.map((file) =>
                this.processAndUpload(
                    reviewId,
                    file,
                    this.s3Service.uploadReviewImages.bind(this.s3Service),
                    this.imageRepository.saveEntityImage.bind(this.imageRepository, EEntityType.REVIEW)
                )
            )
        );
        return true;
    }
}
