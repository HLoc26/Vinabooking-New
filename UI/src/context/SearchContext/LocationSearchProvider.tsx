// src/context/SearchContext/LocationSearchProvider.tsx
import { useState, useCallback } from "react";
import type { ReactNode } from "react";
import axios from "axios";
import { LocationSearchContext } from "./LocationSearchContext";
import type { Query } from "../../types/Query";
import type { Location } from "./LocationSearchContext";

interface LocationSearchProviderProps {
	children: ReactNode;
}

export function LocationSearchProvider(props: LocationSearchProviderProps) {
	const { children } = props;

	const [query, setQuery] = useState<Query>({
		keyword: "",
	});
	const [results, setResults] = useState<Location[]>([]);
	const [loading, setLoading] = useState(false);

	const updateQuery = useCallback((partial: Partial<Query>) => {
		setQuery((prev) => ({ ...prev, ...partial }));
	}, []);

	const searchLocations = useCallback(async () => {
		const searchTerm = query.keyword.trim();

		if (!searchTerm) {
			setResults([]);
			return;
		}

		setLoading(true);
		try {
			// Only send keyword and type for typeahead search
			const params: Record<string, string | number> = {
				keyword: searchTerm,
			};

			if (query.type) {
				params.type = query.type;
			}

			console.log("Searching with params:", params);

			const { data } = await axios.get("http://localhost:3000/accommodations/search", {
				params,
			});

			console.log("API response:", data);
			setResults(data.data?.data || data.data || []);
		} catch (err) {
			console.error("Location search failed:", err);
			setResults([]);
		} finally {
			setLoading(false);
		}
	}, [query.keyword, query.type]);

	return (
		<LocationSearchContext.Provider
			value={{
				query,
				results,
				setQuery,
				updateQuery,
				searchLocations,
				loading,
			}}
		>
			{children}
		</LocationSearchContext.Provider>
	);
}
