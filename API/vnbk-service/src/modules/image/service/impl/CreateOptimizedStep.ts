import sharp from "sharp";
import type { IImageProcessingStep } from "@/modules/image/service/IImageProcessingStep";
import type { ProcessedImage } from "@/modules/image/service/ProcessedImage";
import { EVariantType } from "@/modules/image/enums/EVariantType";
import { BadRequestError } from "@/shared/error/BadRequestError";

/** Produces a width-capped, quality-reduced JPEG optimized for mobile delivery. */
export class CreateOptimizedStep implements IImageProcessingStep {
	constructor(
		private readonly width: number = 1080,
		private readonly quality: number = 70
	) {}

	public async execute(results: ProcessedImage): Promise<ProcessedImage> {
		const original = results.get(EVariantType.ORIGINAL);
		if (!original) throw new BadRequestError("Original image not found");

		const optimizedBuffer = await sharp(original).resize({ width: this.width }).jpeg({ quality: this.quality }).toBuffer();
		results.set(EVariantType.OPTIMIZED, optimizedBuffer);
		return results;
	}
}
