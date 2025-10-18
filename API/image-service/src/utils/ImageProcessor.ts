import sharp from "sharp";
import type { ImageProcessingResult } from "../types/Image";
import NotFoundError from "../errors/NotFoundError";

export class ImageProcessingPipeline {
    private steps: ImageProcessingStep[] = [];

    addStep(step: ImageProcessingStep): this {
        this.steps.push(step);
        return this;
    }

    async execute(original: Buffer): Promise<ImageProcessingResult> {
        const results: ImageProcessingResult = new Map();
        results.set("ORIGINAL", original);

        let currentResults = results;
        for (const step of this.steps) {
            currentResults = await step.execute(currentResults);
        }

        return currentResults;
    }
}

export interface ImageProcessingStep {
    execute(results: ImageProcessingResult): Promise<ImageProcessingResult>;
}

export class CreateThumbnail implements ImageProcessingStep {
    constructor(
        private width: number = 200,
        private height: number = 200
    ) {}

    async execute(results: ImageProcessingResult): Promise<ImageProcessingResult> {
        const original = results.get("ORIGINAL");
        if (!original) {
            throw new NotFoundError("Original image not foumd");
        }

        const thumbnailBuffer = await sharp(original).resize(this.width, this.height).jpeg().toBuffer();
        results.set("THUMBNAIL", thumbnailBuffer);
        return results;
    }
}

export class CreateWEBP implements ImageProcessingStep {
    async execute(results: ImageProcessingResult): Promise<ImageProcessingResult> {
        const original = results.get("ORIGINAL");
        if (!original) {
            throw new NotFoundError("Original image not foumd");
        }

        const webpBuffer = await sharp(original).webp().toBuffer();
        results.set("WEBP", webpBuffer);
        return results;
    }
}

export class CreateOptimized implements ImageProcessingStep {
    constructor(
        private width: number = 1080,
        private quality: number = 70
    ) {}
    async execute(results: ImageProcessingResult): Promise<ImageProcessingResult> {
        const original = results.get("ORIGINAL");
        if (!original) {
            throw new NotFoundError("Original image not foumd");
        }

        const optimizedBuffer = await sharp(original).resize({ width: this.width }).jpeg({ quality: this.quality }).toBuffer();
        results.set("OPTIMIZED", optimizedBuffer);
        return results;
    }
}
