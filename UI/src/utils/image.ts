import type { Image } from "../types/Image";

export const getThumbnailUrl = (imgs: Image[]): string => {
	const targetImage = imgs.find((img) => img.references.some((r) => r.isPrimary)) ?? imgs[0];
	const thumbnailVariant = targetImage?.variants.find((v) => v.variant === "THUMBNAIL");
	const displayUrl = thumbnailVariant?.url ?? targetImage?.url;
	return displayUrl;
};
export const getThumbnailUrls = (imgs: Image[]): string[] => {
	if (!imgs) return [];

	return imgs.map((img) => {
		const thumb = img.variants.find((v) => v.variant === "THUMBNAIL");
		return thumb?.url ?? img.url;
	});
};
