import { useEffect, useState } from "react";
import type { AccommodationRoom } from "../types/Accommodation";
import roomApi from "../services/roomApi";

const useRoomInfo = (roomId: string) => {
	const [room, setRoom] = useState<AccommodationRoom | null>(null);

	useEffect(() => {
		if (!roomId) return;
		let isMounted = true;

		(async () => {
			try {
				const res = await roomApi.getById(roomId);
				if (isMounted) setRoom(res.data);
			} catch (e: unknown) {
				console.log(e);
				if (isMounted) setRoom(null);
			}
		})();
		return () => {
			isMounted = false;
		};
	}, [roomId]);

	return room;
};

export default useRoomInfo;
