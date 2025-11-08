// clients/AccommodationServiceClient.ts
import axios from "axios";
import { AccommodationPayload } from "../types/Accommodation";

class AccommodationServiceClient {
    private readonly axiosInstance;

    constructor() {
        const accommodationServiceUrl = process.env["ACCOMMODATION_ENDPOINT"];
        if (!accommodationServiceUrl) {
            throw new Error("Env not set: ACCOMMODATION_ENDPOINT");
        }
        this.axiosInstance = axios.create({ baseURL: accommodationServiceUrl });
    }

    public async getAccommodationsByRoomId(roomId: string): Promise<AccommodationPayload> {
        const response = await this.axiosInstance.get("", {
            params: { byEntity: "room", entityId: roomId },
        });

        if (!response.data.data || response.data.error) {
            throw new Error(response.data.error);
        }

        return response.data.data;
    }
}

export default new AccommodationServiceClient();
