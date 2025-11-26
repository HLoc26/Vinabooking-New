import { useState, useCallback } from "react";
import type { ReactNode } from "react";
import axios from "axios";
import { LocationSearchContext } from "./LocationSearchContext";
import type { Query } from "../../types/Query";
import type { Location } from "../../types/Location";
import accommodationApi from "../../services/accommodationApi";

const LocationSearchProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
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

			const res = await accommodationApi.search(params);

			const data = res.data;

			console.log("API response:", data);
			// Inside searchLocations() after you get the data
			const rawResults = data || [];

			// Transform the API response into your Location format
			const transformedResults: Location[] = rawResults.map((item) => ({
				id: item.id,
				name: item.name,
				type: item.type, // HOTEL, APARTMENT, etc.
				// This is the key: show city (or fallback to ward/street)
				city: item.address?.city ? (item.address.city === "Hồ Chí Minh" ? "Ho Chi Minh City" : item.address.city) : undefined,
			}));

			setResults(transformedResults);
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
};

export default LocationSearchProvider;
