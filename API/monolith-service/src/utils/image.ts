import { ImageDto } from "@/dto/response/image.dto";
import { EVariantType } from "@/generated/enums";


class ImageUtils {
	// helper: pick best image by variant priority
	static pickBestImage(
		images: ImageDto[], //
		priority: EVariantType[] = [EVariantType.ORIGINAL, EVariantType.OPTIMIZED, EVariantType.WEBP, EVariantType.THUMBNAIL]
	): ImageDto | undefined {
		if (!images || images.length === 0) return undefined;

		// Iterate through priority list to find the first image that possesses that variant
		for (const type of priority) {
			const found = images.find((img) => img.variants.some((v) => v.variant === type));
			if (found) return found;
		}

		// Fallback to first available image
		return images[0];
	}

	// helper: pick up to `count` images, preferring unique id and variant priority
	static pickGallery(
		images: ImageDto[], //
		count = 3,
		priority: EVariantType[] = [EVariantType.ORIGINAL, EVariantType.OPTIMIZED, EVariantType.WEBP, EVariantType.THUMBNAIL]
	): ImageDto[] {
		if (!images || images.length === 0) return [];

		const picked: ImageDto[] = [];
		const pickedIds = new Set<string>();

		// 1. Prefer images containing variants in priority order
		for (const type of priority) {
			for (const img of images) {
				if (picked.length >= count) break;

				// Ensure uniqueness using the root 'id'
				if (pickedIds.has(img.id)) continue;

				// Check if this image has the current priority variant
				const hasVariant = img.variants.some((v) => v.variant === type);

				if (hasVariant) {
					picked.push(img);
					pickedIds.add(img.id);
				}
			}
			if (picked.length >= count) break;
		}

		// 2. Fill with any remaining images if still < count (regardless of variant quality)
		if (picked.length < count) {
			for (const img of images) {
				if (picked.length >= count) break;
				if (!pickedIds.has(img.id)) {
					picked.push(img);
					pickedIds.add(img.id);
				}
			}
		}

		return picked;
	}
}

export default ImageUtils;
