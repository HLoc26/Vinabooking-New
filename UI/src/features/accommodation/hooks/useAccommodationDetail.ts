import { useState, useEffect } from "react";
import type { AccommodationDetail } from "../types/accommodation.types";
import accommodationApi from "../service/accommodationApi";
import type { ImageType } from "../../../types/Image";

export const useAccommodationDetail = (accommodationId: string | undefined) => {
	const [accommodation, setAccommodation] = useState<AccommodationDetail | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!accommodationId) return;

		const fetchData = async () => {
			setLoading(true);
			try {
				const res = await accommodationApi.getAccommodationById(accommodationId);
				if (res.status < 200 || res.status >= 300) throw new Error(`HTTP ${res.status}`);
				const json = res.data;

				if (json.success) {
					setAccommodation(json.data);
				} else {
					setError(json.error || "Failed to load");
				}
			} catch {
				setError("Could not connect to server");
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, [accommodationId]);

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
