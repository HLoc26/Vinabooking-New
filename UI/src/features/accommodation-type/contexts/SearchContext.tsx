// src/contexts/SearchContext.tsx
import React, { createContext, useContext, useState, useCallback } from "react";
import axios from "axios";
import debounce from "lodash.debounce";

interface Location {
	id: string;
	name: string;
	country: string;
}

interface SearchContextValue {
	query: string;
	setQuery: (q: string) => void;
	results: Location[];
	loading: boolean;
	error: string | null;
}

const SearchContext = createContext<SearchContextValue | undefined>(undefined);

export const SearchProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const [query, setQuery] = useState("");
	const [results, setResults] = useState<Location[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	// Debounced search
	const fetchLocations = useCallback(
		debounce(async (q: string) => {
			if (!q.trim()) {
				setResults([]);
				setLoading(false);
				return;
			}
			setLoading(true);
			setError(null);

			try {
				// Replace with your API endpoint
				const res = await axios.get(`/api/locations/search`, { params: { query: q } });
				setResults(res.data);
			} catch (e: unknown) {
				const err = e as Error;
				setError(err.message || "Failed to fetch locations");
				setResults([]);
			} finally {
				setLoading(false);
			}
		}, 300),
		[]
	);

	// Trigger search when query changes
	React.useEffect(() => {
		fetchLocations(query);
	}, [query, fetchLocations]);

	return <SearchContext.Provider value={{ query, setQuery, results, loading, error }}>{children}</SearchContext.Provider>;
};

export const useSearch = () => {
	const context = useContext(SearchContext);
	if (!context) {
		throw new Error("useSearch must be used within a SearchProvider");
	}
	return context;
};
