// src/context/SearchContext/LocationSearchContext.tsx
import { createContext } from "react";
import type { Query } from "../../types/Query";

export interface Location {
	id: string;
	name: string;
	type?: string;
}

export interface LocationSearchContextType {
	query: Query;
	results: Location[];
	setQuery: (q: Query) => void;
	updateQuery: (partial: Partial<Query>) => void;
	searchLocations: () => Promise<void>;
	loading: boolean;
}

export const LocationSearchContext = createContext<LocationSearchContextType | undefined>(undefined);
