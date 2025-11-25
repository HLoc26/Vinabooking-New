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
				console.log("🔍 Fetching counts for type:", type);
				console.log("🏙️ Cities:", cities);

				const results = await Promise.all(
					cities.map(async (city) => {
						try {
							const url = `${import.meta.env.VITE_API_URL}/accommodations/count`;
							const params = { city, type };

							console.log(`📡 Requesting: ${url}`, params);

							const res = await axios.get(url, { params });

							console.log(`✅ Response for ${city}:`, res.data);

							return { city, count: res.data.data?.count ?? 0 };
						} catch (error) {
							console.error(`❌ Error fetching ${city}:`, error);
							// fallback if individual city fails
							return { city, count: 0 };
						}
					})
				);

				console.log("📊 Final results:", results);

				if (isMounted) {
					setCityCounts(Object.fromEntries(results.map((r) => [r.city, r.count])));
					setLoading(false);
				}
			} catch (error: unknown) {
				const e = error as Error;
				console.error("💥 Fatal error:", e);
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
