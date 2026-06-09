import type { DependencyContainer } from "@/di/container";
import type { IModule } from "@/di/IModule";
import { ROUTER } from "@/http/http.tokens";
import { IMAGE_SERVICE, IMAGE_REPOSITORY, IMAGE_PROCESSOR } from "@/modules/image/image.tokens";
import { ImageDao } from "@/modules/image/dao/ImageDao";
import { ImageServiceImpl } from "@/modules/image/service/impl/ImageServiceImpl";
import { ImageProcessorImpl } from "@/modules/image/service/impl/ImageProcessorImpl";
import { ImageRouter } from "@/modules/image/rest/ImageRouter";

/** Wires the image module: repository port -> DAO, processor + service ports -> impls, and its router. */
export class ImageModule implements IModule {
	public register(container: DependencyContainer): void {
		container.registerSingleton(IMAGE_REPOSITORY, ImageDao);
		container.registerSingleton(IMAGE_PROCESSOR, ImageProcessorImpl);
		container.registerSingleton(IMAGE_SERVICE, ImageServiceImpl);
		container.registerSingleton(ROUTER, ImageRouter);
	}
}
