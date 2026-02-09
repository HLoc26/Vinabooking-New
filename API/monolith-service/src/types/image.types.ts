import { EVariantType, Prisma } from "@/generated/client";

export interface IImage {
	id: string;
	s3Key: string;
	filename: string;
	contentType: string;
	size: bigint; // In bytes
	createdAt?: Date;
}

export type UploadedImage = Omit<IImage, "contentType" | "size" | "createdAt" | "filename"> & { variant: EVariantType };

export type FileType = Express.Multer.File;

// Image processing
export type ImageProcessingResultKey = EVariantType;

export type ImageProcessingResult = Map<ImageProcessingResultKey, Buffer>;

// Image Upload
export type UploadResultProperties = "id" | "s3Key";
export type UploadResult = Map<ImageProcessingResultKey, Map<UploadResultProperties, string>>;

// Image retrieval
type BaseImageInfo = Prisma.ImageGetPayload<{
	include: {
		variants: true;
		references: {
			select: {
				isPrimary: true;
			};
		};
	};
}>;

export type ImageFullInfo = Omit<BaseImageInfo, "size" | "variants"> & {
	size: string;
	url: string;
	variants: (BaseImageInfo["variants"][number] & { url: string })[];
};
