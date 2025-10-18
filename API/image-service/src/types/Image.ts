import { EVariantType } from "../../generated/prisma/index.js";

export interface IImage {
    id: string;
    s3Key: string;
    filename: string;
    contentType: string;
    size: bigint; // In bytes
    createdAt?: Date;
}

export type FileType = Express.Multer.File;

// Image processing
export type ImageProcessingResultKey = EVariantType;

export type ImageProcessingResult = Map<ImageProcessingResultKey, Buffer>;

export const ImageProcessingResultName: Record<ImageProcessingResultKey, EVariantType> = {
    ORIGINAL: EVariantType.ORIGINAL,
    THUMBNAIL: EVariantType.THUMBNAIL,
    WEBP: EVariantType.WEBP,
    OPTIMIZED: EVariantType.OPTIMIZED,
};

export interface ImageProcessingOptions {
    thumbnail: boolean;
    webp: boolean;
    optimized: boolean;
}

// Image Upload
export type UploadResultProperties = "id" | "s3Key";
export type UploadResult = Map<ImageProcessingResultKey, Map<UploadResultProperties, string>>;
