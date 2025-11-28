import { useCallback, useMemo, useState } from "react";
import type { Dates, Query } from "../../types/Query";

import SearchContext, { type SearchContextType } from "./context";
import { EAccommodationType } from "../../types/Accommodation";

const initialCheckIn = (() => {
	const d = new Date();
	d.setDate(d.getDate() + 1);
	d.setHours(0, 0, 0, 0);
	return d;
})();
const initialCheckOut = (() => {
	const d = new Date();
	d.setDate(d.getDate() + 2);
	d.setHours(0, 0, 0, 0);
	return d;
})();

const useSearchCriteria = (): SearchContextType => {
	console.log("useSearchCriteria");

	const [tempDates, setTempDates] = useState<Dates>({
		checkIn: initialCheckIn,
		checkOut: initialCheckOut,
	});

	const [searchCriteria, setSearchCriteria] = useState<Query>({
		keyword: "",
		dates: {
			checkIn: initialCheckIn,
			checkOut: initialCheckOut,
		},
		guests: {
			adults: 2,
			children: 0,
			rooms: 1,
		},
		type: EAccommodationType.ALL,
		price: {
			min: 0,
			max: 500,
		},
		facilities: [],
		sortBy: "recommended",
		pagination: {
			page: 1,
			limit: 18,
		},
	});

	const handleUpdateSearchCriteria = useCallback(<K extends keyof Query>(key: K, value: Query[K]) => {
		setSearchCriteria((prev) => ({
			...prev,
			[key]: value,
		}));
	}, []);

	return useMemo(
		() => ({
			searchCriteria,
			handleUpdateSearchCriteria,

			tempDates,
			setTempDates,
		}),
		[tempDates]
	);
};

const SearchProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	console.log("SearchProvider");
	const searchCriteria = useSearchCriteria();

	return <SearchContext.Provider value={searchCriteria}>{children}</SearchContext.Provider>;
};
export default SearchProvider;
