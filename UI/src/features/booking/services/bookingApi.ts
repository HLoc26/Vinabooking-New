// src/features/booking/services/bookingApi.ts
import axios from "axios";
import type { BookingDto } from "../types/BookingDto";

const API_URL = "http://localhost:3000";
const BOOKING_ENDPOINT = `${API_URL}/booking`; // old backend uses /booking route

export const bookingApi = {
  /**
   * Create a booking (mock or real).
   * Maps BookingDto → backend-compatible shape.
   */
  async createBooking(data: BookingDto) {
    // Convert frontend DTO to backend expected shape
    const payload = {
      startDate: data.startDate,
      endDate: data.endDate,
      guestCount: data.guestCount,
      referenceNo: Math.floor(Math.random() * 1_000_000_000).toString(),
      status: "PENDING",
      userId: "mock-user-id", // normally extracted from token by middleware
      details: data.rooms.map((room) => ({
        itemId: room.id,
        itemType: room.type,
        note: room.note ?? "",
        count: 1,
      })),
    };

    const res = await axios.post(BOOKING_ENDPOINT, payload, {
      headers: {
        Authorization: `Bearer ${
          localStorage.getItem("mock_jwt") ?? "mock-jwt-token"
        }`,
        "Content-Type": "application/json",
      },
    });

    return res.data;
  },

  async getBooking(id: string) {
    const res = await axios.get(`${BOOKING_ENDPOINT}/${id}`);
    return res.data;
  },
};
