// src/features/booking/hooks/useFetchImages.ts
import { useState } from "react";
import { bookingApi } from "../services/bookingApi";
import type { BookingImageDto } from "../services/types/BookingDto";

export function useFetchImages() {
	const [loading] = useState(false);
	const [error] = useState<string | null>(null);

	const getAccomImage = async (booking: BookingImageDto) => {
		try {
			const response = await bookingApi.getAccomImage(booking);
			return response;
		} catch (err) {
			console.error("Error fetching images:", err);
			throw err;
		}
	};
	return { getAccomImage, loading, error };
}
