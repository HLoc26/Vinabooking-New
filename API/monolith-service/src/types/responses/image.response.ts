import { ImageDto as Image } from "@/dto/response/image.dto";

export interface UploadResponse {
	success: boolean;
	images: Image[];
}
