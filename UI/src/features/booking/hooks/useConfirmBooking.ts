// src/features/booking/hooks/useConfirmBooking.ts

import { useState } from "react";
import { bookingApi } from "../services/bookingApi";
import type { BookingContextInfo } from "../types/BookingContextInfo";

export function useConfirmBooking() {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const confirmBooking = async (booking: BookingContextInfo) => {
		setLoading(true);
		setError(null);

		try {
			const response = await bookingApi.createBooking(booking);
			return response;
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : "Failed to confirm booking";

			setError(errorMessage);
			throw err; // keep throwing so UI can handle it
		} finally {
			setLoading(false);
		}
	};

	return {
		confirmBooking,
		loading,
		error,
	};
}
