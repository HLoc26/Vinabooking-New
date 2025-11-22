// src/context/LocationSearchContext.tsx
import React, { createContext, useContext, useState } from "react";
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
	searchLocations: (q?: string) => void;
	loading: boolean;
}

const LocationSearchContext = createContext<LocationSearchContextType | undefined>(undefined);

export const LocationSearchProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const [query, setQuery] = useState("");
	const [results, setResults] = useState<Location[]>([]);
	const [loading, setLoading] = useState(false);

	const searchLocations = async (q?: string) => {
		const searchTerm = q ?? query;
		if (!searchTerm) return setResults([]);
		setLoading(true);
		try {
			const { data } = await axios.get(`http://localhost:3000/accommodations/search`, { params: { keyword: encodeURIComponent(searchTerm) } });
			console.log(searchTerm);
			console.log("API response:", data);
			setResults(data.data.data); // data should be an array of Location
		} catch (err) {
			console.error(err);
			setResults([]);
		} finally {
			setLoading(false);
		}
	};

	return <LocationSearchContext.Provider value={{ query, setQuery, results, searchLocations, loading }}>{children}</LocationSearchContext.Provider>;
};

export const useLocationSearch = () => {
	const context = useContext(LocationSearchContext);
	if (!context) throw new Error("useLocationSearch must be used within LocationSearchProvider");
	return context;
};
