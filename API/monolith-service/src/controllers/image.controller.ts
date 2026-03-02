import { GetImagesRequest, ImageUploadMapper, type ImageEntityType, type UploadRequest } from "@/types/requests";
import type { ApiResponse, UploadResponse } from "@/types/responses";
import type { Response } from "express";
import ResponseHelper from "@/utils/response";
import type { FileType, ImageFullInfo } from "@/types/image.types";
import UploadService from "@/services/upload.service";
import { ImageService } from "@/services";

class ImageController {
	readonly #uploadService: UploadService;
	readonly #imageService: ImageService;
	constructor(uploadService: UploadService, imageService: ImageService) {
		this.#uploadService = uploadService;
		this.#imageService = imageService;
	}

	public async upload(req: UploadRequest, res: Response<ApiResponse<UploadResponse>>) {
		const type = req.params.type as ImageEntityType;
		const id = req.params.id;
		const files = req.files as FileType[];

		if (!files?.length) throw new Error("Empty files");

		const entityType = ImageUploadMapper[type];
		if (!entityType) throw new Error(`Invalid upload type: ${type}`);

		const images = await this.#uploadService.handleUploadByEntity(entityType, id, files);

		return ResponseHelper.success<UploadResponse>(res, { success: true, images });
	}

	public async getImages(req: GetImagesRequest, res: Response<ApiResponse<ImageFullInfo[]>>) {
		const type = req.params.type as ImageEntityType;
		const id = req.params.id;

		const entityType = ImageUploadMapper[type];

		const images = await this.#imageService.getImage(entityType, id);
		return ResponseHelper.success(res, images);
	}
}

export default ImageController;
