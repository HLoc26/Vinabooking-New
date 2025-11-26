import { createContext } from "react";
import type { Query } from "../../types/Query";
import type { Location } from "../../types/Location";

export interface LocationSearchContextType {
	query: Query;
	results: Location[];
	setQuery: (q: Query) => void;
	updateQuery: (partial: Partial<Query>) => void;
	searchLocations: () => Promise<void>;
	loading: boolean;
}

export const LocationSearchContext = createContext<LocationSearchContextType | undefined>(undefined);
