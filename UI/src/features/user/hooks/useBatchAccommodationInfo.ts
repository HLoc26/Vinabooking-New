import { useEffect, useState } from "react";
import type { Accommodation } from "../types/Accommodation";
import accommodationApi from "../services/accommodationApi";

const useBatchAccommodationInfo = (accommodationIds: string[]) => {
	const [accommodationInfos, setAccommodationInfos] = useState<Accommodation[] | null>(null);

	useEffect(() => {
		if (!accommodationIds) return;

		let isMounted = true;

		(async () => {
			try {
				const tasks = accommodationIds.map(async (id) => accommodationApi.getInfoById(id).then((r) => r.data as Accommodation));

				const acc = await Promise.all(tasks);

				if (isMounted) setAccommodationInfos(acc);
			} catch (e: unknown) {
				console.log(e);
				if (isMounted) setAccommodationInfos(null);
			}
		})();

		return () => {
			isMounted = false;
		};
	}, [accommodationIds]);

	return accommodationInfos;
};

export default useBatchAccommodationInfo;
