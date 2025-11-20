import { useState, useEffect } from "react";
import type { AccommodationDetail, AccommodationImage } from "../types/accommodation.types";

export const useAccommodationDetail = (accommodationId: string | undefined) => {
	const [accommodation, setAccommodation] = useState<AccommodationDetail | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!accommodationId) return;

		const fetchData = async () => {
			setLoading(true);
			try {
				const res = await fetch(`http://localhost:3000/accommodations/${accommodationId}`);
				if (!res.ok) throw new Error(`HTTP ${res.status}`);
				const json = await res.json();
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

	const getDisplayImages = (): AccommodationImage[] => {
		if (!accommodation?.images) return [];

		const groups: Record<string, AccommodationImage[]> = {};

		for (const img of accommodation.images) {
			if (!groups[img.imageId]) {
				groups[img.imageId] = [];
			}
			groups[img.imageId].push(img);
		}

		return Object.values(groups)
			.map((group) => {
				return (
					group.find((i) => i.variant === "OPTIMIZED") || group.find((i) => i.variant === "WEBP") || group.find((i) => i.variant === "ORIGINAL") || group[0] // fallback to first image if exists
				);
			})
			.filter((img): img is AccommodationImage => !!img);
	};

	return {
		accommodation,
		loading,
		error,
		displayImages: getDisplayImages(),
	};
};
