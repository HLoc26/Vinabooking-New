import { Router, type Request, type Response } from "express";
import ResponseHelper from "../utils/ResponseHelper";
import ImageController from "../controllers/ImageController";
import type { UploadRequest } from "../types/Request";
import UploadClient from "../clients/UploadClient";

// Base route: /images
class ImageRouter {
    public router = Router();
    private imageController = new ImageController();
    private uploadClient = UploadClient.getInstance();

    constructor() {
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
    }
}

export default ImageRouter;
