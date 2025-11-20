import axios, { AxiosInstance } from "axios";
import config from "../config";
import { NotFoundError, BadRequestError } from "../errors";

interface ApiResponse<T> {
    success: boolean;
    data: T;
    error?: string | null;
}

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

            const response = await this.client.get<ApiResponse<any>>(
                `/${roomId}`
            );

            if (response.data.success && response.data.data?.accommodationId) {
                return response.data.data.accommodationId;
            }

            throw new Error(
                `Room service did not return valid accommodationId`
            );
        } catch (error) {
            console.error(
                `[RoomClient] Error calling Room Service for room ${roomId}:`,
                error
            );
            if (axios.isAxiosError(error)) {
                if (error.response?.status === 404) {
                    throw new NotFoundError(
                        `Room with ID ${roomId} not found in Room Service (called /${roomId})`
                    );
                }
                throw new BadRequestError(
                    `Error calling Room Service: ${error.message}`
                );
            }
            throw new Error(
                `Unexpected error fetching accommodationId: ${error}`
            );
        }
    }

    /**
     * Lấy danh sách rooms và số lượng còn trống
     */
    async getRoomsByAccommodationId(
        accommodationId: string,
        startDate?: string,
        endDate?: string
    ): Promise<any[]> {
        try {
            console.log(
                `[RoomClient] Calling Room Service: GET /accommodation/${accommodationId}`
            );

            const params: { [key: string]: string } = {};
            if (startDate) params.startDate = startDate;
            if (endDate) params.endDate = endDate;

            const response = await this.client.get<ApiResponse<any[]>>(
                `/accommodation/${accommodationId}`,
                { params }
            );

            if (response.data.success && Array.isArray(response.data.data)) {
                return response.data.data;
            }

            return [];
        } catch (error) {
            console.error(
                `[RoomClient] Error fetching rooms for accommodation ${accommodationId}:`,
                error
            );
            return [];
        }
    }
}

export const roomClient = new RoomClient();
