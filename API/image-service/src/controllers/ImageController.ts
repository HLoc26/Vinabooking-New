import { EEntityType } from "../../generated/prisma/index.js";
import ImageService from "../services/ImageService";
import { ImageUploadMapper, type ImageUploadType, type UploadRequest } from "../types/Request";
import type { ApiResponse, UploadResponse } from "../types/Response";
import type { Response } from "express";
import ResponseHelper from "../utils/ResponseHelper";
import type { FileType } from "../types/Image";
import BadRequestError from "../errors/BadRequestError";
import S3Service from "../services/S3Service";
import ImageProcessor from "../utils/ImageProcessor";

class ImageController {
    private imageService = new ImageService();
    private s3Service = new S3Service();
    constructor() {}

    public async upload(req: UploadRequest, res: Response<ApiResponse<UploadResponse>>) {
        const type = req.params.type as ImageUploadType;
        const id = req.params.id;
        const files = req.files as FileType[];

        const entityType = ImageUploadMapper[type];

        if (!files || files.length === 0) {
            throw new BadRequestError("Empty files");
        }

        let urls;
        let response;
        let processedFiles;
        switch (entityType) {
            case EEntityType.USER_PROFILE:
                if (!files[0]?.buffer) {
                    throw new BadRequestError("Invalid file buffer");
                }
                processedFiles = await ImageProcessor.createVariants(files[0].buffer, { thumbnail: true, webp: true, optimized: true });
                urls = await this.s3Service.uploadProfileImage(id, processedFiles, files[0].mimetype); // Upload only the first image
                response = await this.imageService.uploadProfileImage(id, urls, files[0]);
                break;
            // case EEntityType.ACCOMMODATION:
            //     // response = this.imageService.uploadAccommodationImage();
            //     break;
            // case EEntityType.ROOM:
            //     // response = this.imageService.uploadRoomImage();
            //     break;
            // case EEntityType.REVIEW:
            //     // response = this.imageService.uploadReviewImage();
            //     break;
            default:
                throw new Error("");
        }

        if (response == false) {
            throw new Error("Unknown error");
        }

        return ResponseHelper.success<UploadResponse>(res, { success: true });
    }
}

export default ImageController;
