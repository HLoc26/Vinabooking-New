import { useState, useEffect } from "react";
import axios from "axios";
import { EAccommodationType } from "../../../types/Accommodation";

export function useCityCounts(cities: string[], type: EAccommodationType) {
	const [cityCounts, setCityCounts] = useState<Record<string, number>>({});
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		let isMounted = true;
		setLoading(true);

		const fetchCounts = async () => {
			try {
				const results = await Promise.all(
					cities.map(async (city) => {
						try {
							const url = `${import.meta.env.VITE_API_URL}/accommodations/count`;
							const params = { city, type };

							const res = await axios.get(url, { params });

							return { city, count: res.data.data?.count ?? 0 };
						} catch (error) {
							console.error(`Error fetching ${city}:`, error);
							// fallback if individual city fails
							return { city, count: 0 };
						}
					})
				);

				if (isMounted) {
					setCityCounts(Object.fromEntries(results.map((r) => [r.city, r.count])));
					setLoading(false);
				}
			} catch (error: unknown) {
				const e = error as Error;
				console.error(" Fatal error:", e);
				if (isMounted) {
					setCityCounts({});
					setLoading(false);
				}
			}
		};

		fetchCounts();

		return () => {
			isMounted = false;
		};
	}, [cities, type]);

	return { cityCounts, loading };
}
