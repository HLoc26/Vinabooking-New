import sharp from "sharp";
import type { ImageProcessingOptions, ImageProcessingResultKey } from "../types/Image.ts";

class ImageProcessor {
    public static async createVariants(imageBuffer: Buffer, options: ImageProcessingOptions) {
        const tasks: [ImageProcessingResultKey, Promise<Buffer>][] = [];

        tasks.push(["ORIGINAL", Promise.resolve(imageBuffer)]);

        if (options.thumbnail) {
            tasks.push(["THUMBNAIL", this.createThumbnail(imageBuffer)]);
        }
        if (options.webp) {
            tasks.push(["WEBP", this.createWebp(imageBuffer)]);
        }
        if (options.optimized) {
            tasks.push(["OPTIMIZED", this.createOptimized(imageBuffer)]);
        }

        const results = await Promise.all(
            tasks.map(([key, promise]) => promise.then((buffer) => [key, buffer] as [ImageProcessingResultKey, Buffer]))
        );
        return new Map(results);
    }

    private static async createThumbnail(imageBuffer: Buffer) {
        return sharp(imageBuffer).resize(200, 200).jpeg().toBuffer();
    }

    private static async createWebp(imageBuffer: Buffer) {
        return sharp(imageBuffer).webp().toBuffer();
    }

    private static async createOptimized(imageBuffer: Buffer) {
        return sharp(imageBuffer).resize({ width: 1080 }).jpeg({ quality: 70 }).toBuffer();
    }
}

export default ImageProcessor;
