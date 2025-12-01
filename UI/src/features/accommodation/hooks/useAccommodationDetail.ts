import { useState, useEffect } from "react";
import type { AccommodationDetail } from "../types/accommodation.types";
import accommodationApi from "../service/accommodationApi";
import type { ImageType } from "../../../types/Image";

// Helper format date YYYY-MM-DD
const formatDate = (date: Date | null | undefined): string | undefined => {
	if (!date) return undefined;
	return date.toLocaleDateString("sv-SE");
};

export const useAccommodationDetail = (accommodationId: string | undefined, startDate?: Date | null, endDate?: Date | null) => {
	const [accommodation, setAccommodation] = useState<AccommodationDetail | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!accommodationId) return;

		const fetchData = async () => {
			setLoading(true);
			try {
				const checkInStr = formatDate(startDate);
				const checkOutStr = formatDate(endDate);

				console.log("🔍 DEBUG DATE SENDING:", {
					originalStart: startDate,
					formattedStart: checkInStr, // Xem nó là 01/12 hay 30/11?
					originalEnd: endDate,
					formattedEnd: checkOutStr,
				});

				const res = await accommodationApi.getAccommodationById(accommodationId, checkInStr, checkOutStr);

				if (res.status < 200 || res.status >= 300) throw new Error(`HTTP ${res.status}`);
				const json = res.data;

				if (json.success) {
					setAccommodation(json.data);
				} else {
					setError(json.error || "Failed to load");
				}
			} catch (err) {
				setError("Could not connect to server");
				console.error(err);
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, [accommodationId, startDate, endDate]);

	const getThumbnails = (): ImageType[] => {
		if (!accommodation?.images) return [];

		return accommodation?.images.filter((img) => img.variant === "THUMBNAIL").filter((img): img is ImageType => !!img);
	};

	const getDisplayImages = (): ImageType[] => {
		if (!accommodation?.images) return [];

		return accommodation?.images.filter((img) => img.variant === "WEBP").filter((img): img is ImageType => !!img);
	};

	return {
		accommodation,
		loading,
		error,
		thumbnails: getThumbnails(),
		displayImages: getDisplayImages(),
	};
};
