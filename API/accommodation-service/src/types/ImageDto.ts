export interface ImageDto {
	id: string;
	url: string;
	variant: "ORIGINAL" | "THUMBNAIL" | "WEBP" | "OPTIMIZED";
	isPrimary?: boolean;
}
