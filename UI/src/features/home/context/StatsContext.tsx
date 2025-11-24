import React, { createContext, useContext, useEffect, useState } from "react";

export interface CityStat {
	city: string;
	count: number;
}

export interface TypeStat {
	type: string;
	count: number;
}

interface StatsResponse {
	success: boolean;
	data: {
		types: TypeStat[];
		cities: CityStat[];
	};
	error: any;
}

interface StatsContextValue {
	loading: boolean;
	error: string | null;
	cities: CityStat[];
	types: TypeStat[];
}

const StatsContext = createContext<StatsContextValue | null>(null);

export const StatsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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
			} catch (err) {
				setError("Network error");
			} finally {
				setLoading(false);
			}
		};

		fetchStats();
	}, []);

	return <StatsContext.Provider value={{ loading, error, cities, types }}>{children}</StatsContext.Provider>;
};

export const useStats = () => {
	const ctx = useContext(StatsContext);
	if (!ctx) throw new Error("useStats must be used inside StatsProvider");
	return ctx;
};
