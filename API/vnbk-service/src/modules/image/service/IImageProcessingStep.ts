import type { ProcessedImage } from "@/modules/image/service/ProcessedImage";

/** One step in the image-processing pipeline: derives a variant from the accumulated result. */
export interface IImageProcessingStep {
	execute(results: ProcessedImage): Promise<ProcessedImage>;
}
