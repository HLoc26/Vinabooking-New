import { Router, type Request, type Response } from "express";
import ResponseHelper from "../utils/ResponseHelper";
import ImageController from "../controllers/ImageController";
import type { GetImagesRequest, UploadRequest } from "../types/Request";
import multer from "multer";
import S3Service from "../services/S3Service";
import ImageRepository from "../repositories/ImageRepository";
import { UploadService } from "../services/UploadService";
import UploadClient from "../clients/UploadClient";

class ImageRouterFactory {
    static createImageRouter() {
        const s3Service = new S3Service();
        const imageRepository = new ImageRepository();
        const uploadService = new UploadService(s3Service, imageRepository);
        const imageController = new ImageController(uploadService, imageRepository, s3Service);
        const uploadClient = UploadClient.getInstance();
        const imageRouter = new ImageRouter(imageController, Router(), uploadClient);
        return imageRouter.router;
    }
}

// Base route: /images
class ImageRouter {
    constructor(
        private readonly imageController: ImageController,
        public readonly router: Router,
        private readonly uploadClient: multer.Multer
    ) {
        this.registerRoutes();
    }

    private registerRoutes() {
        this.router.get("/health", (_req: Request, res: Response) => {
            return ResponseHelper.success(res, { service: "Image Service", success: true });
        });

        this.router.post("/:type/:id", this.uploadClient.array("files", 10), (req: Request, res: Response) => {
            const uploadRequest = req as unknown as UploadRequest;
            return this.imageController.upload(uploadRequest, res);
        });

        this.router.get("/:type/:id", (req: Request, res: Response) => {
            const request = req as unknown as GetImagesRequest;
            return this.imageController.getImages(request, res);
        });
    }
}

export default ImageRouterFactory;
