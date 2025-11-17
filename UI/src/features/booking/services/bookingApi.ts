// src/features/booking/services/bookingApi.ts
import axios from "axios";
import Cookies from "js-cookie";
import type { RoomInfo } from "./types/RoomInfo";
import type { BookingContextInfo } from "./types/BookingContextInfo";
import type { UserInfo } from "./types/UserInfo";

const ACCESS_TOKEN_KEY = import.meta.env.VITE_ACCESS_TOKEN_KEY;
const API_URL = "http://localhost:3000";
const BOOKING_ENDPOINT = `${API_URL}/bookings`; // old backend uses /booking route
const IMAGE_ENDPOINT = `${API_URL}/images`;
const ROOM_ENDPOINT = `${API_URL}/rooms`;
const ACCOM_ENDPOINT = `${API_URL}/accommodations`;

export const bookingApi = {
	/**
	 * Create a booking (mock or real).
	 * Maps BookingDto → backend-compatible shape.
	 */
	async createBooking(booking: BookingContextInfo, user: UserInfo, rooms: RoomInfo[]) {
		const payload = {
			startDate: booking.startDate,
			endDate: booking.endDate,
			guestCount: booking.guestCount,
			phone: user.phone,
			userId: user.id,
			details: {
				create: rooms.map((room) => ({
					itemId: room.id,
					itemType: room.type ?? "ROOM",
					count: 1,
					note: room.note ?? "",
				})),
			},
		};
		const token = Cookies.get(ACCESS_TOKEN_KEY);
		const res = await axios.post(BOOKING_ENDPOINT, payload, {
			headers: {
				Authorization: `Bearer ${token ?? "mock-jwt-token"}`,
				"Content-Type": "application/json",
			},
		});

		return res.data;
	},

	async getAccommIdByRoomId(roomId: string) {
		const room = await axios.get(`${ROOM_ENDPOINT}/${roomId}`);
		return room.data.data.accommodationId;
	},

	async getAccomImage(accommId: string) {
		try {
			// Get images using accommodationId
			const imgRes = await axios.get(`${IMAGE_ENDPOINT}/accommodation/${accommId}`);

			return imgRes.data?.data?.images ?? [];
		} catch (error) {
			console.error("Error fetching accommodation images:", error);
			return [];
		}
	},
	async getRoomImage(roomId: string) {
		try {
			const res = await axios.get(`${IMAGE_ENDPOINT}/room/${roomId}`);
			// Return only the array of image objects, or empty array if none
			return res.data?.data?.images ?? [];
		} catch (error) {
			console.error("Error fetching room images:", error);
			return []; // return empty array on error
		}
	},
	async getBooking(id: string) {
		const res = await axios.get(`${BOOKING_ENDPOINT}/${id}`);
		return res.data;
	},

	async getRoom(id: string) {
		const res = await axios.get(`${ROOM_ENDPOINT}/${id}`);
		return res.data.data;
	},

	async getAccomm(id: string) {
		const res = await axios.get(`${ACCOM_ENDPOINT}/${id}`);
		return res.data.data;
	},
};
