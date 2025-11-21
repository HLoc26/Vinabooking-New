export type Image = {
	id: string;
	url: string;
	variant: "ORIGINAL" | "THUMBNAIL" | "WEBP" | "OPTIMIZED";
	imageId: string;
	isPrimary: boolean;
};
