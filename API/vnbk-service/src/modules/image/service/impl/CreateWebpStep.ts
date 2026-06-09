import sharp from "sharp";
import type { IImageProcessingStep } from "@/modules/image/service/IImageProcessingStep";
import type { ProcessedImage } from "@/modules/image/service/ProcessedImage";
import { EVariantType } from "@/modules/image/enums/EVariantType";
import { BadRequestError } from "@/shared/error/BadRequestError";

/** Produces a WebP rendition of the original buffer. */
export class CreateWebpStep implements IImageProcessingStep {
	public async execute(results: ProcessedImage): Promise<ProcessedImage> {
		const original = results.get(EVariantType.ORIGINAL);
		if (!original) throw new BadRequestError("Original image not found");

		const webpBuffer = await sharp(original).webp().toBuffer();
		results.set(EVariantType.WEBP, webpBuffer);
		return results;
	}
}
