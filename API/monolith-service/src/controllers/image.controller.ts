import { GetImagesRequest, ImageUploadMapper, type ImageEntityType, type UploadRequest } from "@/types/requests";
import type { ApiResponse, GetImageResponse, UploadResponse } from "@/types/responses";
import type { Response } from "express";
import ResponseHelper from "@/utils/response";
import type { FileType } from "@/types/image.types";
import { UploadService } from "@/services/upload.service";
import ImageRepository from "@/repositories/image.repository";
import S3Service from "@/services/s3.service";
import { EVariantType } from "@/generated/enums";

class ImageController {
	constructor(
		private readonly uploadService: UploadService,
		private readonly s3Service: S3Service,
		private readonly imageRepository: ImageRepository
	) {}

	public async upload(req: UploadRequest, res: Response<ApiResponse<UploadResponse>>) {
		const type = req.params.type as ImageEntityType;
		const id = req.params.id;
		const files = req.files as FileType[];

		if (!files?.length) throw new Error("Empty files");

		const entityType = ImageUploadMapper[type];
		if (!entityType) throw new Error(`Invalid upload type: ${type}`);

		const images = await this.uploadService.handleUploadByEntity(entityType, id, files);

		return ResponseHelper.success<UploadResponse>(res, { success: true, images });
	}

	public async getImages(req: GetImagesRequest, res: Response<ApiResponse<GetImageResponse>>) {
		const type = req.params.type as ImageEntityType;
		const id = req.params.id;

		const entityType = ImageUploadMapper[type];

		const images = await this.imageRepository.getEntityImage(entityType, id);

		/**
         *  id: string;
             url: string;
             variant: EVariantType;
         }
         */
		const response = images.flatMap((img) => {
			const isPrimary = img.references[0].isPrimary;
			const baseVariant = {
				id: img.id,
				url: this.s3Service.getS3Url(img.s3Key),
				variant: EVariantType.ORIGINAL,
				imageId: img.id,
				isPrimary: isPrimary,
			};
			const variants = img.variants.map((img) => ({
				id: img.id,
				url: this.s3Service.getS3Url(img.s3Key),
				variant: img.variant,
				imageId: img.id,
				isPrimary: isPrimary,
			}));
			return [baseVariant, ...variants];
		});

		return ResponseHelper.success<GetImageResponse>(res, { images: response });
	}
}

export default ImageController;
