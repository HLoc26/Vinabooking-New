// src/clients/booking.client.ts
import axios, { AxiosInstance } from "axios";
import config from "../config";
import { BookedRoomCount, BookingSummaryResponse } from "../types/BookingDto";

class BookingClient {
    private client: AxiosInstance;

    constructor() {
        if (!config.bookingEndpoint) {
            throw new Error(
                "BOOKING_ENDPOINT environment variable is not set."
            );
        }
        this.client = axios.create({
            baseURL: config.bookingEndpoint,
            timeout: 5000,
        });
    }

    /**
     * Gọi API POST /summary để lấy số lượng phòng đã đặt
     */
    async getBookedCounts(
        roomIds: string[],
        startDate: string,
        endDate: string
    ): Promise<BookedRoomCount[]> {
        try {
            console.log(
                `[BookingClient] Fetching booked counts for ${roomIds.length} rooms`
            );

            const response = await this.client.post<BookingSummaryResponse>(
                "/bookings/booked-counts",
                {
                    roomIds,
                    startDate,
                    endDate,
                }
            );

            if (response.data.success && Array.isArray(response.data.data)) {
                return response.data.data;
            }
            return [];
        } catch (error) {
            console.error(
                "[BookingClient] Error fetching booked counts:",
                error
            );
            return [];
        }
    }
}

export const bookingClient = new BookingClient();
