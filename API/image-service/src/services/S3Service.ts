import { PutObjectCommand } from "@aws-sdk/client-s3";
import { EEntityType, EVariantType } from "../../generated/prisma/index.js";
import S3ClientSingleton from "../clients/S3Client.ts";
import { type ImageProcessingResultKey, type UploadResult, type UploadResultProperties } from "../types/Image.ts";
import { v4 as uuidv4 } from "uuid";

class S3Service {
    private s3Client = S3ClientSingleton.getInstance();

    private async upload(key: string, buffer: Buffer, contentType: string) {
        const BUCKET = S3ClientSingleton.bucketName;
        await this.s3Client.send(
            new PutObjectCommand({
                Bucket: BUCKET,
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

    public async uploadProfileImage(
        profileId: string,
        processedFiles: Map<ImageProcessingResultKey, Buffer>,
        originalMimeType: string
    ): Promise<UploadResult> {
        const baseKey = `${EEntityType.USER_PROFILE}/${profileId}`;

        const results: [ImageProcessingResultKey, Map<UploadResultProperties, string>][] = await Promise.all(
            Array.from(processedFiles.entries()).map(async ([key, buffer]) => {
                let mimeType = originalMimeType;
                if (key === "WEBP") mimeType = "image/webp";
                else if (key === EVariantType.THUMBNAIL || key === EVariantType.OPTIMIZED) mimeType = "image/jpeg";

                const { id, s3Key } = await this.uploadVariant(baseKey, buffer, key, mimeType);

                const props = new Map<UploadResultProperties, string>();
                props.set("id", id);
                props.set("s3Key", s3Key);

                return [key, props] as [ImageProcessingResultKey, Map<UploadResultProperties, string>];
            })
        );

        return new Map(results);
    }

    // public async uploadAccommodationImages() {}
    // public async uploadRoomImages() {}
    // public async uploadReviewImages() {}
}
export default S3Service;
