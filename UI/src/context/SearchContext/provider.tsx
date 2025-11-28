import { useCallback, useState } from "react";
import type { Dates, Query } from "../../types/Query";

import SearchContext, { type SearchContextType } from "./context";

const useSearchCriteria = (): SearchContextType => {
	const defaultCheckIn = new Date();
	defaultCheckIn.setDate(defaultCheckIn.getDate() + 1);
	const defaultCheckOut = new Date();
	defaultCheckOut.setDate(defaultCheckOut.getDate() + 2);

	const [tempDates, setTempDates] = useState<Dates>({
		checkIn: defaultCheckIn,
		checkOut: defaultCheckOut,
	});

	const [searchCriteria, setSearchCriteria] = useState<Query>({
		keyword: "",
		dates: {
			checkIn: defaultCheckIn,
			checkOut: defaultCheckOut,
		},
		guests: {
			adults: 2,
			children: 0,
			rooms: 1,
		},
	});

	const handleUpdateSearchCriteria = useCallback(<K extends keyof Query>(key: K, value: Query[K]) => {
		console.log("Updating", key, "to", value);
		setSearchCriteria((prev) => ({
			...prev,
			[key]: value,
		}));
	}, []);

	return {
		searchCriteria,
		handleUpdateSearchCriteria,

		tempDates,
		setTempDates,
	};
};

const SearchProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const searchCriteria = useSearchCriteria();

	return <SearchContext.Provider value={searchCriteria}>{children}</SearchContext.Provider>;
};
export default SearchProvider;
