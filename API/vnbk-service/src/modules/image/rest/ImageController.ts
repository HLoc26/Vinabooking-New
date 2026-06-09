import { inject, injectable } from "tsyringe";
import type { Request } from "express";
import { BaseController } from "@/http/BaseController";
import { IMAGE_SERVICE } from "@/modules/image/image.tokens";
import type { IImageService } from "@/modules/image/service/IImageService";
import type { ImageResponse } from "@/modules/image/dto/response/ImageResponse";
import type { UploadedImageResponse } from "@/modules/image/dto/response/UploadedImageResponse";
import type { UploadFile } from "@/modules/image/service/ProcessedImage";
import { ENTITY_TYPE_PARAM_MAP, type EntityTypeParam } from "@/modules/image/rest/EntityTypeParam";
import { EEntityType } from "@/modules/image/enums/EEntityType";
import { BadRequestError } from "@/shared/error/BadRequestError";

@injectable()
export class ImageController extends BaseController {
	constructor(@inject(IMAGE_SERVICE) private readonly imageService: IImageService) {
		super();
	}

	public upload = this.handle<UploadedImageResponse[]>(async (req: Request) => {
		const entityType = this.resolveEntityType(this.param(req, "type"));
		const entityId = this.param(req, "id");
		const files = (req.files as Express.Multer.File[] | undefined) ?? [];
		if (files.length === 0) throw new BadRequestError("Empty files");

		const uploadFiles: UploadFile[] = files.map((file) => ({
			buffer: file.buffer,
			mimetype: file.mimetype,
			size: file.size,
		}));

		const images = await this.imageService.uploadForEntity(entityType, entityId, uploadFiles);
		return this.created(images);
	});

	public getImages = this.handle<ImageResponse[]>(async (req: Request) => {
		const entityType = this.resolveEntityType(this.param(req, "type"));
		const entityId = this.param(req, "id");
		const images = await this.imageService.getImagesByEntity(entityType, entityId);
		return this.ok(images);
	});

	public delete = this.handle<null>(async (req: Request) => {
		const imageId = this.param(req, "id");
		await this.imageService.deleteImage(imageId);
		return this.ok(null);
	});

	/** Reads a required route parameter as a single string, or throws 400. */
	private param(req: Request, name: string): string {
		const value = req.params[name];
		if (typeof value !== "string" || value.length === 0) {
			throw new BadRequestError(`Missing route parameter: ${name}`);
		}
		return value;
	}

	private resolveEntityType(type: string): EEntityType {
		const entityType = ENTITY_TYPE_PARAM_MAP[type as EntityTypeParam];
		if (!entityType) throw new BadRequestError(`Invalid image type: ${type}`);
		return entityType;
	}
}
