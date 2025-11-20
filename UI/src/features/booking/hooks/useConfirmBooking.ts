// src/features/booking/hooks/useConfirmBooking.ts
import { useState } from "react";
import { bookingApi } from "../services/bookingApi";
import type { UserInfo } from "../types/UserInfo";
import type { RoomInfo } from "../types/RoomInfo";
import type { BookingContextInfo } from "../types/BookingContextInfo";

export function useConfirmBooking() {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const confirmBooking = async (booking: BookingContextInfo, user: UserInfo, rooms: RoomInfo[]) => {
		setLoading(true);
		setError(null);

		try {
			const response = await bookingApi.createBooking(booking, user, rooms);
			console.log("Booking created:", response);
			return response;
		} catch (err) {
			console.error("Error confirming booking:", err);
			const errorMessage = err instanceof Error ? err.message : "Failed to confirm booking";
			setError(errorMessage);
			throw err; // Re-throw the error so the caller can catch it
		} finally {
			setLoading(false);
		}
	};

	return { confirmBooking, loading, error };
}
