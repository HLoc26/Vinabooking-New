import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export type RentalType = "entire_place" | "private_room" | "shared_room";

export type AccommodationType = "apartment" | "hotel" | "villa" | "resort" | "unique";

interface ListingDraftState {
	rentalType: RentalType | null;
	accommodationType: AccommodationType | null;

	// later steps
	address?: {
		country: string;
		city: string;
		lat: number;
		lng: number;
	};
}
// const locationSlice = createSlice({
// 	name: "location",
// 	initialState: { lat: null, lng: null },
// 	reducers: {
// 		setCoordinate: (state, action) => {
// 			state.lat = action.payload.lat;
// 			state.lng = action.payload.lng;
// 		},
// 	},
// });
const initialState: ListingDraftState = {
	rentalType: null,
	accommodationType: null,
};

const listingDraftSlice = createSlice({
	name: "listingDraft",
	initialState,
	reducers: {
		setRentalType(state, action: PayloadAction<RentalType>) {
			state.rentalType = action.payload;
		},
		setAccommodationType(state, action: PayloadAction<AccommodationType>) {
			state.accommodationType = action.payload;
		},
		setAddress(state, action: PayloadAction<ListingDraftState["address"]>) {
			state.address = action.payload;
		},
		resetDraft() {
			return initialState;
		},
	},
});

export const { setRentalType, setAccommodationType, setAddress, resetDraft } = listingDraftSlice.actions;

export default listingDraftSlice.reducer;
