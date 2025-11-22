// src/context/LocationSearchContext.tsx
import React, { createContext, useContext, useState, useCallback } from "react";
import axios from "axios";
import type { EAccommodationType } from "../../../types/acommodation";

export interface Location {
	id: string;
	name: string;
	type: EAccommodationType;
}

interface LocationSearchContextType {
	query: string;
	results: Location[];
	setQuery: (q: string) => void;
	searchLocations: (q?: string) => Promise<void>;
	loading: boolean;
}

const LocationSearchContext = createContext<LocationSearchContextType | undefined>(undefined);

export const LocationSearchProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const [query, setQuery] = useState("");
	const [results, setResults] = useState<Location[]>([]);
	const [loading, setLoading] = useState(false);

	const searchLocations = useCallback(
		async (q?: string) => {
			const searchTerm = (q ?? query).trim();

			// If empty after trim → clear results
			if (!searchTerm) {
				setResults([]);
				return;
			}

			setLoading(true);
			try {
				const { data } = await axios.get("http://localhost:3000/accommodations/search", {
					params: { keyword: searchTerm }, // Let axios + URLSearchParams handle encoding
				});

				console.log("Searching:", searchTerm);
				console.log("API response:", data);

				// Adjust based on your actual API response shape
				setResults(data.data?.data || data.data || []);
			} catch (err) {
				console.error("Location search failed:", err);
				setResults([]);
			} finally {
				setLoading(false);
			}
		},
		[query]
	);

	return (
		<LocationSearchContext.Provider
			value={{
				query,
				results,
				setQuery,
				searchLocations,
				loading,
			}}
		>
			{children}
		</LocationSearchContext.Provider>
	);
};

export const useLocationSearch = (): LocationSearchContextType => {
	const context = useContext(LocationSearchContext);
	if (!context) {
		throw new Error("useLocationSearch must be used within LocationSearchProvider");
	}
	return context;
};
