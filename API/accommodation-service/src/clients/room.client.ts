import axios, { AxiosInstance } from "axios";
import config from "../config";
import { NotFoundError, BadRequestError } from "../errors";

class RoomClient {
	private client: AxiosInstance;

	constructor() {
		if (!config.roomEndpoint) {
			throw new Error("ROOM_SERVICE_URL environment variable is not set.");
		}
		this.client = axios.create({
			baseURL: config.roomEndpoint,
			timeout: 5000,
		});
	}

	/**
	 * Lấy accommodationId từ roomId
	 */
	async getAccommodationIdByRoomId(roomId: string): Promise<string> {
		try {
			console.log(`[RoomClient] Calling Room Service: GET /${roomId}`);
			const response = await this.client.get<any>(`/${roomId}`);

			if (!response.data || !response.data.data.accommodationId) {
				console.error(`[RoomClient] Invalid response from Room Service for room ${roomId}:`, response.data);
				throw new Error(`Room service did not return accommodationId for room ${roomId}`);
			}
			return response.data.data.accommodationId;
		} catch (error) {
			console.error(`[RoomClient] Error calling Room Service for room ${roomId}:`, error);
			if (axios.isAxiosError(error)) {
				if (error.response?.status === 404) {
					throw new NotFoundError(`Room with ID ${roomId} not found in Room Service`);
				}
				throw new BadRequestError(`Error calling Room Service (${error.response?.status}): ${error.message}`);
			}
			throw new Error(`Unexpected error fetching accommodationId for room ${roomId}: ${error}`);
		}
	}

	/**
	 * Lấy danh sách rooms bằng accommodationId
	 */
	async getRoomsByAccommodationId(accommodationId: string): Promise<any[]> {
		// Use a specific Room DTO type if available
		try {
			console.log(`[RoomClient] Calling Room Service: GET /accommodation/${accommodationId}`);
			// Adjust endpoint path if necessary
			const response = await this.client.get<any[]>(`/accommodation/${accommodationId}`); // Assuming it returns an array of rooms
			return response.data || [];
		} catch (error) {
			console.error(`[RoomClient] Error fetching rooms from Room Service for accommodation ${accommodationId}:`, error);
			if (axios.isAxiosError(error) && error.response?.status === 404) {
				// If accommodation not found in room service, maybe return empty array?
				return [];
			}
			// Re-throw other errors or return empty array based on desired behavior
			return []; // Return empty array on error to avoid breaking the main request
		}
	}
}

export const roomClient = new RoomClient();
