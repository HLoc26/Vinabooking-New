import { useEffect, useState } from "react";
import type { Accommodation } from "../types/Accommodation";
import accommodationApi from "../services/accommodationApi";

const cache: Record<string, Accommodation> = {};

const useAccommodationByRoom = (roomId: string) => {
	const [accommodation, setAccommodation] = useState<Accommodation | null>(roomId && cache[roomId] ? cache[roomId] : null);

	useEffect(() => {
		if (!roomId) return;
		if (cache[roomId]) {
			setAccommodation(cache[roomId]);
			return;
		}

		let isMounted = true;
		(async () => {
			try {
				const data = await accommodationApi.getByEntity("room", roomId);
				if (isMounted) {
					setAccommodation(data.data);
					cache[roomId] = data.data; // lưu cache
				}
			} catch {
				if (isMounted) setAccommodation(null);
			}
		})();

		return () => {
			isMounted = false;
		};
	}, [roomId]);

	return accommodation;
};

export default useAccommodationByRoom;
