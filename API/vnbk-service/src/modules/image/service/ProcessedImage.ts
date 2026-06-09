import { EVariantType } from "@/modules/image/enums/EVariantType";

/**
 * The result of running an upload buffer through the processing pipeline:
 * a map from variant type to its rendered buffer (always includes ORIGINAL).
 */
export type ProcessedImage = Map<EVariantType, Buffer>;

/** A variant that has been uploaded to object storage: its generated id + S3 key. */
export interface UploadedVariant {
	id: string;
	s3Key: string;
}

/** The result of uploading every processed variant: map from variant type to its stored location. */
export type UploadResult = Map<EVariantType, UploadedVariant>;

/** A single uploaded file in memory (mirrors Express.Multer.File fields we use). */
export interface UploadFile {
	buffer: Buffer;
	mimetype: string;
	size: number;
}
