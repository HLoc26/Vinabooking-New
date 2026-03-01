export interface ImageVariant {
	id: string;
	s3Key: string;
	variant: "OPTIMIZED" | "WEBP" | "THUMBNAIL" | string; // literal union for known types, string for flexibility
	imageId: string;
	url: string;
}

export interface ImageReference {
	isPrimary: boolean;
}

export interface Image {
	id: string;
	s3Key: string;
	filename: string;
	contentType: string;
	size: string; // Kept as string because input is "903223"
	createdAt: string;
	variants: ImageVariant[];
	references: ImageReference[];
	url: string;
}
/**
 * @deprecated use Image instead
 */
export type ImageType = {
	id: string;
	url: string;
	variant: "ORIGINAL" | "WEBP" | "OPTIMIZED" | "THUMBNAIL";
	imageId: string;
};
