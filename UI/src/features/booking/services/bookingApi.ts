// src/features/booking/services/bookingApi.ts
import axios from "axios";
import type { BookingDto, BookingImageDto } from "./types/BookingDto";
import Cookies from "js-cookie";

const ACCESS_TOKEN_KEY = import.meta.env.VITE_ACCESS_TOKEN_KEY;
const API_URL = "http://localhost:3000";
const BOOKING_ENDPOINT = `${API_URL}/bookings`; // old backend uses /booking route
const IMAGE_ENDPOINT = `${API_URL}/images`;
const ACCOMMODATION_ENDPOINT = `${API_URL}/accommodations`;

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
			status: null || "PENDING",
			userId: data.user.id,
			details: {
				create: data.room.map((room) => ({
					itemId: room.id,
					itemType: room.type,
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
	async getAccomImage(data: BookingImageDto) {
		try {
			//Get accommodation by roomId
			const accomRes = await axios.get(`${ACCOMMODATION_ENDPOINT}?byEntity=room&entityId=${data.id}`);

			const accommodationId = accomRes.data?.data?.id;
			if (!accommodationId) return [];

			// Get images using accommodationId
			const imgRes = await axios.get(`${IMAGE_ENDPOINT}/accommodation/${accommodationId}`);

			return imgRes.data?.data?.images ?? [];
		} catch (error) {
			console.error("Error fetching accommodation images:", error);
			return [];
		}
	},
	async getRoomImage(data: BookingImageDto) {
		try {
			const res = await axios.get(`${IMAGE_ENDPOINT}/room/${data.id}`);
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
};
