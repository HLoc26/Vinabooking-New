import { useEffect, useRef, useState } from "react";
import type { RoomInfo } from "../services/types/RoomInfo";
import { bookingApi } from "../services/bookingApi";
import { useBookingContext } from "./useBookingContext";

const useRoomsInfo = (roomIds: string[]) => {
	const [roomsInfo, setRoomsInfo] = useState<RoomInfo[]>([]);
	const [loading, setLoading] = useState(true);
	const prevIdsRef = useRef<string>("");
	const { context: bookingContext } = useBookingContext();

	useEffect(() => {
		if (roomIds.length === 0) return;

		const idsKey = roomIds.join(",");
		if (prevIdsRef.current === idsKey) return;
		prevIdsRef.current = idsKey;

		setLoading(true);

		const fetchRoomInfo = async () => {
			try {
				const entries = await Promise.all(roomIds.map((id) => bookingApi.getRoom(id)));

				if (!entries || entries.length === 0) return;

				const updated = entries.map((r) => {
					const matched = bookingContext.items.find((i) => i.id === r.id);
					return { ...r, count: matched ? matched.count : 0 };
				});

				setRoomsInfo(updated);
			} catch (err) {
				console.error("Failed to fetch rooms info", err);
			} finally {
				setLoading(false);
			}
		};

		fetchRoomInfo();
	}, [roomIds, bookingContext.items]);

	return { roomsInfo, loading };
};

export default useRoomsInfo;
