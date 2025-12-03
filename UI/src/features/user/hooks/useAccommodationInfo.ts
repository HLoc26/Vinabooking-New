import { useEffect, useState } from "react";
import type { Accommodation } from "../types/Accommodation";
import accommodationApi from "../services/accommodationApi";

const useAccommodationInfo = (accommodationId: string) => {
	const [accommodationInfo, setAccommodationInfo] = useState<Accommodation | null>(null);

	useEffect(() => {
		if (!accommodationId) return;

		let isMounted = true;

		(async () => {
			try {
				const acc = await accommodationApi.getInfoById(accommodationId);
				if (isMounted) setAccommodationInfo(acc);
			} catch (e: unknown) {
				console.log(e);
				if (isMounted) setAccommodationInfo(null);
			}
		})();

		return () => {
			isMounted = false;
		};
	}, [accommodationId]);

	return accommodationInfo;
};

export default useAccommodationInfo;
