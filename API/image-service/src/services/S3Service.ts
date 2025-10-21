import { PutObjectCommand } from "@aws-sdk/client-s3";
import { EEntityType, EVariantType } from "../../generated/prisma/index.js";
import S3ClientSingleton from "../clients/S3Client";
import { type ImageProcessingResultKey, type UploadResult, type UploadResultProperties } from "../types/Image";
import { v4 as uuidv4 } from "uuid";

export default class S3Service {
    private s3Client = S3ClientSingleton.getInstance();
    private readonly bucket = S3ClientSingleton.bucketName;

    private async upload(key: string, buffer: Buffer, contentType: string) {
        await this.s3Client.send(
            new PutObjectCommand({
                Bucket: this.bucket,
                Key: key,
                Body: buffer,
                ContentType: contentType,
                ACL: "public-read",
            })
        );
    }

    private async uploadVariant(baseKey: string, buffer: Buffer, variantName: ImageProcessingResultKey, mimeType: string) {
        const id = uuidv4();
        const mimeToExt: Record<string, string> = {
            "image/jpeg": "jpg",
            "image/png": "png",
            "image/webp": "webp",
        };
        const ext = mimeToExt[mimeType] ?? "jpg";
        const key = `${baseKey}/${id}-${variantName.toLowerCase()}.${ext}`;
        await this.upload(key, buffer, mimeType);
        return { id, s3Key: key };
    }

    private detectMimeType(variant: ImageProcessingResultKey, originalMimeType: string): string {
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

    /**
     * Hàm tổng quát hoá upload cho mọi entity
     * @param entityType - Loại entity (USER_PROFILE, ACCOMMODATION, ROOM, REVIEW,...)
     * @param entityId - ID của entity
     * @param processedFiles - Map variant -> buffer ảnh
     * @param originalMimeType - MIME của file gốc
     */
    public async uploadEntityImages(
        entityType: EEntityType,
        entityId: string,
        processedFiles: Map<ImageProcessingResultKey, Buffer>,
        originalMimeType: string
    ): Promise<UploadResult> {
        const baseKey = `${entityType}/${entityId}`;

        const results: [ImageProcessingResultKey, Map<UploadResultProperties, string>][] = await Promise.all(
            Array.from(processedFiles.entries()).map(async ([variant, buffer]) => {
                const mimeType = this.detectMimeType(variant, originalMimeType);
                const { id, s3Key } = await this.uploadVariant(baseKey, buffer, variant, mimeType);

                const props = new Map<UploadResultProperties, string>();
                props.set("id", id);
                props.set("s3Key", s3Key);

                return [variant, props] as [ImageProcessingResultKey, Map<UploadResultProperties, string>];
            })
        );

        return new Map(results);
    }

    private createUploader(entityType: EEntityType) {
        return (entityId: string, processedFiles: Map<EVariantType, Buffer>, originalMimeType: string) =>
            this.uploadEntityImages(entityType, entityId, processedFiles, originalMimeType);
    }

    // alias
    public uploadProfileImage = this.createUploader(EEntityType.USER_PROFILE);
    public uploadAccommodationImages = this.createUploader(EEntityType.ACCOMMODATION);
    public uploadRoomImages = this.createUploader(EEntityType.ROOM);
    public uploadReviewImages = this.createUploader(EEntityType.REVIEW);

    public getS3Url(s3Key: string) {
        const bucket = this.bucket;
        const region = S3ClientSingleton.region;

        return `https://${bucket}.s3.${region}.amazonaws.com/${s3Key}`;
    }
}
