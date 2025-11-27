import { createContext, type Dispatch, type SetStateAction } from "react";
import type { Dates, Query } from "../../types/Query";

export interface SearchContextType {
	searchCriteria: Query;
	handleUpdateSearchCriteria: <K extends keyof Query>(key: K, value: Query[K]) => void;
	tempDates: Dates;
	setTempDates: Dispatch<SetStateAction<Dates>>;
}

const SearchContext = createContext<SearchContextType | null>(null);

export default SearchContext;
