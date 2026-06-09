import { injectable } from "tsyringe";
import { BaseRouter } from "@/http/BaseRouter";
import { ImageController } from "@/modules/image/rest/ImageController";
import { AuthGuard } from "@/http/middleware/AuthGuard";
import { MulterProvider } from "@/infrastructure/storage/MulterProvider";

@injectable()
export class ImageRouter extends BaseRouter {
	constructor(
		private readonly controller: ImageController,
		private readonly auth: AuthGuard,
		private readonly multer: MulterProvider
	) {
		super();
		this.registerRoutes();
	}

	public get basePath(): string {
		return "/images";
	}

	protected registerRoutes(): void {
		// type ∈ profile | accommodation | room | review
		this.router.post("/:type/:id", this.auth.handle, this.multer.upload.array("files", 10), this.controller.upload);
		this.router.get("/:type/:id", this.controller.getImages);
		this.router.delete("/:id", this.auth.handle, this.controller.delete);
	}
}
