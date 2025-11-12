import { GetImagesRequest, ImageUploadMapper, type ImageEntityType, type UploadRequest } from "../types/Request";
import type { ApiResponse, GetImageResponse, UploadResponse } from "../types/Response";
import type { Response } from "express";
import ResponseHelper from "../utils/ResponseHelper";
import type { FileType } from "../types/Image";
import BadRequestError from "../errors/BadRequestError";
import { UploadService } from "../services/UploadService.js";
import ImageRepository from "../repositories/ImageRepository";
import S3Service from "../services/S3Service";
import { EVariantType } from "../../generated/prisma";

class ImageController {
	constructor(
		private readonly uploadService: UploadService,
		private readonly imageRepository: ImageRepository,
		private readonly s3Service: S3Service
	) {}

	public async upload(req: UploadRequest, res: Response<ApiResponse<UploadResponse>>) {
		const type = req.params.type as ImageEntityType;
		const id = req.params.id;
		const files = req.files as FileType[];

		if (!files?.length) throw new BadRequestError("Empty files");

		const entityType = ImageUploadMapper[type];
		if (!entityType) throw new BadRequestError(`Invalid upload type: ${type}`);

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
			const baseVariant = {
				id: img.id,
				url: this.s3Service.getS3Url(img.s3Key),
				variant: EVariantType.ORIGINAL,
				imageId: img.id,
			};
			const variants = img.variants.map((img) => ({
				id: img.id,
				url: this.s3Service.getS3Url(img.s3Key),
				variant: img.variant,
				imageId: img.id,
			}));
			return [baseVariant, ...variants];
		});

		return ResponseHelper.success<GetImageResponse>(res, { images: response });
	}
}

export default ImageController;
