import { ResponseImage, UploadedImage } from "@/types/image.types";

export interface UploadResponse {
	success: boolean;
	images: UploadedImage[];
}

export interface GetImageResponse {
	images: ResponseImage[];
}
