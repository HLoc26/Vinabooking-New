// src/features/booking/services/bookingApi.ts
import axios from "axios";
import type { BookingDto } from "../types/BookingDto";
import Cookies from "js-cookie";


const ACCESS_TOKEN_KEY = import.meta.env.VITE_ACCESS_TOKEN_KEY;
const token = Cookies.get(ACCESS_TOKEN_KEY);
const API_URL = "http://localhost:3000";
const BOOKING_ENDPOINT = `${API_URL}/bookings`; // old backend uses /booking route

export const bookingApi = {
  /**
   * Create a booking (mock or real).
   * Maps BookingDto → backend-compatible shape.
   */
  async createBooking(data: BookingDto) {
    const payload = {
      startDate: data.startDate,
      endDate: data.endDate,
      guestCount: data.guestCount,
      phone: data.user.phone,
      status: "PENDING",
      userId: "mock-user-123", // for now
      details: {
        create: data.rooms.map((room) => ({
          itemId: room.id,
          itemType: room.type,
          count: 1,
          note: room.note ?? "",
        })),
      },
    };

    const res = await axios.post(BOOKING_ENDPOINT, payload, {
      headers: {
        Authorization: `Bearer ${token ?? "mock-jwt-token"}`,
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
