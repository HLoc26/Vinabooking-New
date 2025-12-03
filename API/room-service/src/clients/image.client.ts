import axios, { AxiosInstance } from "axios";
import config from "../config"; // Đảm bảo config có imageEndpoint
import type { ImageDto } from "../types/ImageDto";

interface ApiResponse<T> {
	success: boolean;
	data: T;
	error: string | null;
}

interface ImageServiceData {
	images: ImageDto[];
}

class ImageClient {
	private client: AxiosInstance;

	constructor() {
		if (!config.imageEndpoint) {
			throw new Error("IMAGE_ENDPOINT environment variable is not set.");
		}
		this.client = axios.create({
			baseURL: `${config.imageEndpoint}`, // http://image-service:3007
			timeout: 5000,
		});
	}

	/**
	 * Lấy danh sách ảnh cho một Room
	 * Endpoint: GET /ROOM/:id
	 */
	async getImagesForRoom(roomId: string): Promise<ImageDto[]> {
		const entityType = "ROOM";
		const url = `/${entityType}/${roomId}`;

		try {
			// console.log(`[ImageClient] Calling Image Service: GET ${url}`);

			const response = await this.client.get<ApiResponse<ImageServiceData>>(url);

			if (response.data.success && response.data.data?.images) {
				return response.data.data.images;
			}
			return [];
		} catch (error) {
			console.error(`[ImageClient] Error fetching images for ${entityType} ${roomId}:`, error);
			return [];
		}
	}
}

export const imageClient = new ImageClient();
