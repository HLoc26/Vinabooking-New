import { UploadedImage } from "./Image";

export interface ApiResponse<T> {
    success: boolean;
    data: T | null;
    error: string | null;
}

export interface UploadResponse {
    success: boolean;
    images: UploadedImage[];
}
