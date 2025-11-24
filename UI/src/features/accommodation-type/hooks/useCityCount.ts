import { useState, useEffect } from "react";
import axios from "axios";
import { EAccommodationType } from "../../../types/acommodation";

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
							const res = await axios.get(`${import.meta.env.VITE_API_URL}/accommodations/count`, {
								params: { city, type },
							});
							return { city, type, count: res.data.data?.count ?? 0 };
						} catch {
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
				console.log(e);
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
