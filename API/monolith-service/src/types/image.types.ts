export type FileType = Express.Multer.File;

// Image processing
export type ImageProcessingResultKey = string; // Was EVariantType
export type ImageProcessingResult = Map<ImageProcessingResultKey, Buffer>;

// Image Upload
export type UploadResultProperties = "id" | "s3Key";
export type UploadResult = Map<ImageProcessingResultKey, Map<UploadResultProperties, string>>;
