import { EEntityType } from "../../generated/prisma/index.js";
import { ImageUploadMapper, type ImageUploadType, type UploadRequest } from "../types/Request";
import type { ApiResponse, UploadResponse } from "../types/Response";
import type { Response } from "express";
import ResponseHelper from "../utils/ResponseHelper";
import type { FileType } from "../types/Image";
import BadRequestError from "../errors/BadRequestError";
import { UploadService } from "../services/UploadService.js";

class ImageController {
    constructor(private readonly uploadService: UploadService) {}

    public async upload(req: UploadRequest, res: Response<ApiResponse<UploadResponse>>) {
        const type = req.params.type as ImageUploadType;
        const id = req.params.id;
        const files = req.files as FileType[];

        if (!files?.length) throw new BadRequestError("Empty files");

        const entityType = ImageUploadMapper[type];
        if (!entityType) throw new BadRequestError(`Invalid upload type: ${type}`);

        switch (entityType) {
            case EEntityType.USER_PROFILE:
                await this.uploadService.handleUserProfileUpload(id, files[0]);
                break;

            case EEntityType.ACCOMMODATION:
                await this.uploadService.handleAccommodationUpload(id, files);
                break;

            case EEntityType.ROOM:
                await this.uploadService.handleRoomUpload(id, files);
                break;

            case EEntityType.REVIEW:
                await this.uploadService.handleReviewUpload(id, files);
                break;

            default:
                throw new BadRequestError("Unsupported entity type");
        }

        return ResponseHelper.success(res, { success: true });
    }
}

export default ImageController;
