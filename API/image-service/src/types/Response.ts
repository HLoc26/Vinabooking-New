import { ResponseImage, UploadedImage } from "./Image";

export interface ApiResponse<T> {
	success: boolean;
	data: T | null;
	error: string | null;
}

export interface UploadResponse {
	success: boolean;
	images: UploadedImage[];
}

export interface GetImageResponse {
	images: ResponseImage[];
}
