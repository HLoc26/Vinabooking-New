import { useState, useEffect } from "react";
import axios from "axios";

export function useCityImage(cityName: string): string | undefined {
	const [imageUrl, setImageUrl] = useState<string | undefined>();

	useEffect(() => {
		if (!cityName) return;

		const fetchImage = async () => {
			try {
				const res = await axios.get(`${import.meta.env.VITE_API_URL}/images/city/${encodeURIComponent(cityName)}`);
				const images = res.data?.data?.images;
				if (images && images.length > 0) {
					// pick the variant you want: ORIGINAL > THUMBNAIL > OPTIMIZED
					const original = images.find((img: any) => img.variant === "ORIGINAL");
					const thumbnail = images.find((img: any) => img.variant === "THUMBNAIL");
					setImageUrl(original?.url ?? thumbnail?.url ?? images[0].url);
				}
			} catch (error) {
				console.error("Failed to fetch city image", error);
				setImageUrl(undefined); // fallback if needed
			}
		};
		fetchImage();
	}, [cityName]);

	return imageUrl;
}
