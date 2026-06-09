import { EntityType } from "@/models/image";
import { ImageDto } from "@/dto/response/image.dto";
import { DeleteImageRequest, GetImagesRequest, ImageUploadMapper, type ImageEntityType, type UploadRequest } from "@/types/requests";
import type { ApiResponse, UploadResponse } from "@/types/responses";
import type { Request, Response } from "express";
import ResponseHelper from "@/utils/response";
import type { FileType } from "@/types/image.types";
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

		const rawEntityType = ImageUploadMapper[type];
		if (!rawEntityType) throw new Error(`Invalid upload type: ${type}`);

		const entityType = rawEntityType as unknown as EntityType;

		const images = await this.#uploadService.handleUploadByEntity(entityType, id, files);
		const mappedImages = this.#imageService.mapToDto(images);

		return ResponseHelper.success<UploadResponse>(res, { success: true, images: mappedImages });
	}

	public async getImages(req: GetImagesRequest, res: Response<ApiResponse<ImageDto[]>>) {
		const type = req.params.type as ImageEntityType;
		const id = req.params.id;

		const rawEntityType = ImageUploadMapper[type];
		const entityType = rawEntityType as unknown as EntityType;

		const images = await this.#imageService.getImage(entityType, id);
		return ResponseHelper.success(res, images);
	}

	public async delete(req: DeleteImageRequest, res: Response<ApiResponse<null>>) {
		const id = req.params.id;
		await this.#imageService.deleteImage(id);
		return ResponseHelper.success(res, null);
	}
}

export default ImageController;
