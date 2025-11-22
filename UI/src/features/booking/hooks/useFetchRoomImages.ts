import { useEffect, useState } from "react";
import { bookingApi } from "../services/bookingApi";
import type { ImageType } from "../services/types/Image";

export const useFetchRoomsImages = (roomIds: string[]) => {
	const [roomImagesMap, setImagesMap] = useState<Record<string, ImageType[]>>({});
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (!roomIds || roomIds.length === 0) return;

		let ignore = false;
		setLoading(true);

		const fetchAllImages = async () => {
			try {
				const entries = await Promise.all(
					roomIds.map(async (roomId) => {
						const roomImages = await bookingApi.getRoomImage(roomId);
						return [roomId, roomImages] as [string, ImageType[]];
					})
				);

				if (!ignore) {
					const result: Record<string, ImageType[]> = Object.fromEntries(entries);
					setImagesMap(result);
				}
			} catch (err) {
				console.error("Failed to fetch rooms images", err);
			} finally {
				if (!ignore) setLoading(false);
			}
		};

		fetchAllImages();

		return () => {
			ignore = true;
		};
	}, [roomIds]);

	return { roomImagesMap, loading };
};
