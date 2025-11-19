import { useEffect, useRef, useState } from "react";
import { bookingApi } from "../services/bookingApi";
import type { AccommodationInfo } from "../services/types/Accommodation";

const useAccommodationInfo = (accommodationId: string) => {
	const [accommInfo, setAccommInfo] = useState<AccommodationInfo>();
	const [loading, setLoading] = useState(true);
	const prevIdsRef = useRef<string>("");

	useEffect(() => {
		if (!accommodationId) return;
		if (prevIdsRef.current === accommodationId) return;

		prevIdsRef.current = accommodationId;
		setLoading(true);

		const fetchInfo = async () => {
			try {
				const info = await bookingApi.getAccomm(accommodationId);
				setAccommInfo(info);
			} catch (err: unknown) {
				console.log((err as Error).message);
				setAccommInfo(undefined);
			} finally {
				setLoading(false);
			}
		};

		fetchInfo();
	}, [accommodationId]);

	return { accommInfo, loading };
};

export default useAccommodationInfo;
