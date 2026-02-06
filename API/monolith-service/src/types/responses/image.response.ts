import { UploadedImage } from "@/types/image.types";

export interface UploadResponse {
	success: boolean;
	images: UploadedImage[];
}
