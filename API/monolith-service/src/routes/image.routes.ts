import { Router, type Request, type Response } from "express";
import ImageController from "@/controllers/image.controller";
import type { DeleteImageRequest, GetImagesRequest, UploadRequest } from "../dto/request";
import multer from "multer";
import { authMiddleware } from "@/middlewares/auth.middleware";

// Base route: /images
class ImageRouter {
	readonly #imageController: ImageController;
	readonly #uploadClient: multer.Multer;
	constructor(
		public router: Router,
		imageController: ImageController,
		uploadClient: multer.Multer
	) {
		this.#imageController = imageController;
		this.#uploadClient = uploadClient;
		this.registerRoutes();
	}

	private registerRoutes() {
		this.router.post(
			"/:type/:id", // type could be "profile" | "accommodation" | "room" | "review"
			authMiddleware,
			this.#uploadClient.array("files", 10),
			(req: Request, res: Response) => {
				const uploadRequest = req as unknown as UploadRequest;
				return this.#imageController.upload(uploadRequest, res);
			}
		);

		this.router.get("/:type/:id", (req: Request, res: Response) => {
			const request = req as unknown as GetImagesRequest;
			return this.#imageController.getImages(request, res);
		});

		this.router.delete("/:id", authMiddleware, (req: Request, res: Response) => {
			const request = req as unknown as DeleteImageRequest;
			return this.#imageController.delete(request, res);
		});
	}
}

export default ImageRouter;
