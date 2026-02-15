import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Query } from "../../types/Query";
import { EAccommodationType } from "../../types/Accommodation";
import { datesToStringDates } from "../../utils/dateFormatter";

const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);

const dayAfter = new Date();
dayAfter.setDate(dayAfter.getDate() + 2);

const initialState: Query = {
	keyword: "",
	dates: datesToStringDates({ checkIn: tomorrow, checkOut: dayAfter }),
	guests: { adults: 2, children: 0, rooms: 1 },
	price: { min: 0, max: 500 },
	type: EAccommodationType.HOTEL,
	sortBy: "price_asc",
	facilities: [],
	pagination: {
		limit: 20,
		page: 1,
	},
};

const searchSlice = createSlice({
	name: "search",
	initialState,
	reducers: {
		updateSearchCriteria: <K extends keyof Query>(state: Query, action: PayloadAction<{ key: K; value: Query[K] }>) => {
			state[action.payload.key] = action.payload.value;
		},
		syncFromUrl: (_state: Query, action: PayloadAction<Query>) => {
			return action.payload;
		},
		resetSearch: () => initialState,
	},
});

export const { updateSearchCriteria, syncFromUrl, resetSearch } = searchSlice.actions;
export default searchSlice.reducer;
