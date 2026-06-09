import { injectable } from "tsyringe";
import type { IImageProcessor } from "@/modules/image/service/IImageProcessor";
import type { IImageProcessingStep } from "@/modules/image/service/IImageProcessingStep";
import type { ProcessedImage } from "@/modules/image/service/ProcessedImage";
import { EVariantType } from "@/modules/image/enums/EVariantType";
import { CreateThumbnailStep } from "@/modules/image/service/impl/CreateThumbnailStep";
import { CreateWebpStep } from "@/modules/image/service/impl/CreateWebpStep";
import { CreateOptimizedStep } from "@/modules/image/service/impl/CreateOptimizedStep";

/**
 * Sharp-backed image processor. Runs the original buffer through an ordered
 * pipeline of steps (thumbnail -> webp -> optimized), each adding one variant to
 * the accumulated result. Mirrors the monolith `ImageProcessingPipeline`.
 */
@injectable()
export class ImageProcessorImpl implements IImageProcessor {
	private readonly steps: IImageProcessingStep[] = [new CreateThumbnailStep(), new CreateWebpStep(), new CreateOptimizedStep()];

	public async process(original: Buffer): Promise<ProcessedImage> {
		let results: ProcessedImage = new Map<EVariantType, Buffer>();
		results.set(EVariantType.ORIGINAL, original);

		for (const step of this.steps) {
			results = await step.execute(results);
		}

		return results;
	}
}
