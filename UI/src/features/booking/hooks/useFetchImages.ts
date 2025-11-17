// src/features/booking/hooks/useFetchImages.ts
import { useState, useCallback } from "react";
import { bookingApi } from "../services/bookingApi";
import type { BookingImageDto } from "../services/types/BookingDto";

/**
 *
 * @deprecated
 */
export function useFetchImages() {
	const [loading] = useState(false);
	const [error] = useState<string | null>(null);

	const getImages = useCallback(async (data: BookingImageDto) => {
		try {
			if (data.entity === "room") {
				return await bookingApi.getRoomImage(data.id);
			}
			if (data.entity === "accommodation") {
				return await bookingApi.getAccomImage(data.id);
			}
			return [];
		} catch (err) {
			console.error("Error fetching images:", err);
			throw err;
		}
	}, []); // Empty dependency array means this function never changes

	return { getImages, loading, error };
}
