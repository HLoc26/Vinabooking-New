// src/context/SearchContext/useLocationSearch.tsx
import { useContext } from "react";
import { LocationSearchContext } from "./LocationSearchContext";
import type { LocationSearchContextType } from "./LocationSearchContext";

export const useLocationSearch = (): LocationSearchContextType => {
	const context = useContext(LocationSearchContext);
	if (!context) {
		throw new Error("useLocationSearch must be used within LocationSearchProvider");
	}
	return context;
};
