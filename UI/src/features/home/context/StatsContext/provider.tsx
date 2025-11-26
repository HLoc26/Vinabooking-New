import { useEffect, useState } from "react";
import type { CityStat, StatsResponse, TypeStat } from "../../types/Stats";
import StatsContext from "./context";

const StatsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [cities, setCities] = useState<CityStat[]>([]);
	const [types, setTypes] = useState<TypeStat[]>([]);

	useEffect(() => {
		const fetchStats = async () => {
			try {
				const res = await fetch("http://localhost:3000/accommodations/stats");
				const json: StatsResponse = await res.json();

				if (!json.success) {
					setError("Failed to load stats");
					return;
				}

				setCities(json.data.cities);
				setTypes(json.data.types);
			} catch (err: unknown) {
				console.error(err);
				setError("Network error");
			} finally {
				setLoading(false);
			}
		};

		fetchStats();
	}, []);

	return <StatsContext.Provider value={{ loading, error, cities, types }}>{children}</StatsContext.Provider>;
};

export default StatsProvider;
