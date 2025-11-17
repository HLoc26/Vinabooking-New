import { useEffect, useState } from "react";
import { bookingApi } from "../services/bookingApi";
import type { ImageType } from "../services/types/Image";

export const useFetchAccommodationImages = (roomId: string) => {
	const [accomImages, setAccommImages] = useState<ImageType[]>([]);
	const [accomImagesLoading, setLoading] = useState(false);

	useEffect(() => {
		if (!roomId) return;

		let ignore = false;

		const fetchImages = async () => {
			setLoading(true);
			try {
				const accommId = await bookingApi.getAccommIdByRoomId(roomId);

				if (!accommId || ignore) return;

				const images = await bookingApi.getAccomImage(accommId); // <-- array of ImageType

				if (!ignore) setAccommImages(images);
			} catch (err) {
				console.error("Failed to fetch accommodation images", err);
			} finally {
				if (!ignore) setLoading(false);
			}
		};

		fetchImages();

		return () => {
			ignore = true;
		};
	}, [roomId]);

	return { accomImages, accomImagesLoading };
};
