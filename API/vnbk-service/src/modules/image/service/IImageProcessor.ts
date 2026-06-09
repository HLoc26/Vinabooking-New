import type { ProcessedImage } from "@/modules/image/service/ProcessedImage";

/** Turns an original image buffer into its set of processed variants. */
export interface IImageProcessor {
	process(original: Buffer): Promise<ProcessedImage>;
}
