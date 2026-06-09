import sharp from "sharp";
import type { IImageProcessingStep } from "@/modules/image/service/IImageProcessingStep";
import type { ProcessedImage } from "@/modules/image/service/ProcessedImage";
import { EVariantType } from "@/modules/image/enums/EVariantType";
import { BadRequestError } from "@/shared/error/BadRequestError";

/** Produces a fixed-size JPEG thumbnail from the original buffer. */
export class CreateThumbnailStep implements IImageProcessingStep {
	constructor(
		private readonly width: number = 200,
		private readonly height: number = 200
	) {}

	public async execute(results: ProcessedImage): Promise<ProcessedImage> {
		const original = results.get(EVariantType.ORIGINAL);
		if (!original) throw new BadRequestError("Original image not found");

		const thumbnailBuffer = await sharp(original).resize(this.width, this.height).jpeg().toBuffer();
		results.set(EVariantType.THUMBNAIL, thumbnailBuffer);
		return results;
	}
}
