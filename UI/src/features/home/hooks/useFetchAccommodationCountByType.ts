import { useEffect, useState } from "react";
import { EAccommodationType, type Accommodation } from "../../../types/Accommodation";
import accommodationApi from "../../../services/accommodationApi";

export const useFetchAccommodationCountByType = (type: EAccommodationType) => {
	const [accommodations, setAccommodations] = useState<Accommodation[]>([]);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		let cancelled = false;

		const fetchSafe = async () => {
			setLoading(true);

			try {
				const filterType = type !== EAccommodationType.ALL ? type : null; // If type is ALL -> remove type params -> find all

				// Get total
				const first = await accommodationApi.getByType(filterType, 1, 1);

				const total = first.data?.meta?.total ?? 0;

				if (total === 0) {
					if (!cancelled) setAccommodations([]);
					return;
				}

				// Request a batch of 300 accomms
				const BATCH_SIZE = 300;
				const totalPages = Math.ceil(total / BATCH_SIZE);

				const requests = Array.from({ length: totalPages }, (_, i) => {
					const page = i + 1;
					return accommodationApi.getByType(filterType, page, BATCH_SIZE);
				});

				const results = await Promise.all(requests);

				const merged: Accommodation[] = results.flatMap((r) => r.data?.data ?? []);

				if (!cancelled) setAccommodations(merged);
			} catch (err) {
				console.error(err);
				if (!cancelled) setAccommodations([]);
			} finally {
				if (!cancelled) setLoading(false);
			}
		};

		fetchSafe();

		return () => {
			cancelled = true;
		};
	}, [type]);

	return { accommodations, loading };
};
