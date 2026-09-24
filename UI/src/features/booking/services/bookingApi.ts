import axioInstance from "../../../services/apiClient";
import Cookies from "js-cookie";
import type { BookingContextInfo } from "../types/BookingContextInfo";
import type { Booking } from "../types/Booking";
import type { ApiResponse } from "../../../types/Response";
import type { QuoteRequestInput, QuoteResponse } from "../types/pricing.types";

const ACCESS_TOKEN_KEY = import.meta.env.VITE_ACCESS_TOKEN_KEY;
const BOOKING_ENDPOINT = "/bookings";
const IMAGE_ENDPOINT = "/images";
const ROOM_ENDPOINT = "/rooms";
const ACCOM_ENDPOINT = "/accommodations";
const PAYMENT_ENDPOINT = "/payments";

export const bookingApi = {
	async getQuote(input: QuoteRequestInput): Promise<QuoteResponse> {
		const res = await axioInstance.post<ApiResponse<QuoteResponse>>("/pricing/quote", input);
		if (!res.data.success || !res.data.data) {
			throw new Error(res.data.error || "Failed to fetch price quote");
		}
		return res.data.data;
	},

	async getByUserId(userId: string) {
		return axioInstance.get<ApiResponse<Booking[]>>("/bookings", { params: { entity: "user", id: userId } }).then((r) => r.data);
	},

	async getById(bookingId: string) {
		return axioInstance.get<ApiResponse<Booking>>("/bookings", { params: { entity: "id", id: bookingId } }).then((r) => r.data);
	},

	async cancel(bookingId: string, note?: string) {
		return axioInstance.patch(`/bookings/cancel?id=${bookingId}`, { note }).then((r) => r.data);
	},

	async createBooking(booking: BookingContextInfo) {
		const token = Cookies.get(ACCESS_TOKEN_KEY);

		// Resolve item types from room records (some are ROOM, some BED).
		const rooms = await Promise.all(
			booking.items.map(async (item) => {
				const res = await axioInstance.get(`${ROOM_ENDPOINT}/${item.id}`);
				return res.data.data;
			})
		);

		const items = rooms.map((room) => ({
			itemId: room.id,
			itemType: (room.type ?? "ROOM") as "ROOM" | "BED",
			count: booking.items.find((i) => i.id === room.id)?.count ?? 1,
		}));

		// Quote-then-book: BE re-computes pricing and verifies the hash matches.
		// Capture bookedAt once and reuse for the quote AND the booking payload so
		// BE re-quote uses the same lead-day basis (avoids hash drift around HCM
		// midnight).
		const bookedAt = new Date().toISOString();
		const quoteRes = await axioInstance.post(`/pricing/quote`, {
			checkIn: booking.startDate,
			checkOut: booking.endDate,
			bookedAt,
			items,
		});
		const quote = quoteRes.data?.data;
		if (!quote?.quoteHash) {
			throw new Error("Failed to fetch price quote");
		}

		const payload = {
			startDate: booking.startDate,
			endDate: booking.endDate,
			guestCount: booking.guestCount,
			quoteHash: quote.quoteHash,
			bookedAt,
			details: {
				create: rooms.map((room) => ({
					itemId: room.id,
					itemType: room.type ?? "ROOM",
					count: booking.items.find((i) => i.id === room.id)?.count ?? 1,
					note: room.note ?? "",
				})),
			},
			phone: booking.leader.phone,
			leaderName: booking.leader.name,
			leaderEmail: booking.leader.email,
		};

		const res = await axioInstance.post(BOOKING_ENDPOINT, payload, {
			headers: {
				Authorization: `Bearer ${token ?? "mock-jwt-token"}`,
				"Content-Type": "application/json",
			},
		});

		return res.data;
	},

	async saveDraft(booking: BookingContextInfo) {
		const token = Cookies.get(ACCESS_TOKEN_KEY);

		const payload = {
			startDate: booking.startDate,
			endDate: booking.endDate,
			guestCount: booking.guestCount,
			items: booking.items,
			leaderName: booking.leader.name,
			leaderEmail: booking.leader.email,
			phone: booking.leader.phone,
			status: "DRAFT",
		};

		const res = await axioInstance.post(`${BOOKING_ENDPOINT}/draft`, payload, {
			headers: {
				Authorization: `Bearer ${token ?? "mock-jwt-token"}`,
				"Content-Type": "application/json",
			},
		});

		return res.data;
	},
	async getAccommIdByRoomId(roomId: string) {
		const room = await axioInstance.get(`${ROOM_ENDPOINT}/${roomId}`);
		return room.data.data.accommodationId;
	},

	async getAccomImage(accommId: string) {
		try {
			// Get images using accommodationId
			const imgRes = await axioInstance.get(`${IMAGE_ENDPOINT}/accommodation/${accommId}`);

			return imgRes.data?.data?.images ?? [];
		} catch (error) {
			console.error("Error fetching accommodation images:", error);
			return [];
		}
	},
	async getRoomImage(roomId: string) {
		try {
			const res = await axioInstance.get(`${IMAGE_ENDPOINT}/room/${roomId}`);
			// Return only the array of image objects, or empty array if none
			return res.data?.data?.images ?? [];
		} catch (error) {
			console.error("Error fetching room images:", error);
			return []; // return empty array on error
		}
	},
	async getBooking(id: string) {
		const res = await axioInstance.get(`${BOOKING_ENDPOINT}/${id}`);
		return res.data;
	},

	async getRoom(id: string) {
		try {
			const res = await axioInstance.get(`${ROOM_ENDPOINT}/${id}`);
			console.log(res);
			return res.data.data;
		} catch (error) {
			console.log(error);
		}
	},

	async getAccomm(id: string) {
		const res = await axioInstance.get(`${ACCOM_ENDPOINT}/${id}`);
		return res.data.data;
	},

	async createPaymentLink(bookingId: string, returnUrl: string, cancelUrl: string) {
		const token = Cookies.get(ACCESS_TOKEN_KEY);
		const res = await axioInstance.post(
			`${PAYMENT_ENDPOINT}/create`,
			{ bookingId, returnUrl, cancelUrl },
			{
				headers: {
					Authorization: `Bearer ${token ?? "mock-jwt-token"}`,
					"Content-Type": "application/json",
				},
			}
		);
		return res.data;
	},

	async verifyPayment(referenceNo: number) {
		const res = await axioInstance.get(`${PAYMENT_ENDPOINT}/verify`, { params: { referenceNo } });
		return res.data;
	},
};
