import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { BookingContextInfo } from "../../types/BookingContextInfo";

const initialState: BookingContextInfo = {
	accommodationId: "",
	guestCount: 1,
	items: [],
	startDate: new Date(),
	endDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
	leader: {
		email: "",
		name: "",
		phone: "",
	},
};

const bookingSlice = createSlice({
	name: "booking",
	initialState,
	reducers: {
		updateBookingInfo<K extends keyof BookingContextInfo>(state: BookingContextInfo, action: PayloadAction<{ key: K; value: BookingContextInfo[K] }>) {
			state[action.payload.key] = action.payload.value;
		},
		setAccommodationId(state, action: PayloadAction<string>) {
			state.accommodationId = action.payload;
		},
		setGuestCount(state, action: PayloadAction<number>) {
			state.guestCount = action.payload;
		},
		setDates(state, action: PayloadAction<{ startDate: Date; endDate: Date }>) {
			state.startDate = action.payload.startDate;
			state.endDate = action.payload.endDate;
		},
		setLeader(state, action: PayloadAction<BookingContextInfo["leader"]>) {
			state.leader = action.payload;
		},
		setBookingField: <K extends keyof BookingContextInfo>(
			state: BookingContextInfo,
			action: PayloadAction<{
				key: K;
				value: BookingContextInfo[K];
			}>
		) => {
			state[action.payload.key] = action.payload.value;
		},
		setBookingInfo: (state, action: PayloadAction<BookingContextInfo>) => {
			return action.payload;
		},
		updateRoomQuantity(state, action: PayloadAction<{ roomId: string; count: number }>) {
			const { roomId, count } = action.payload;
			const existing = state.items.find((i) => i.id === roomId);

			if (existing) {
				existing.count = count;
			} else {
				state.items.push({
					id: roomId,
					itemType: "ROOM",
					count,
				});
			}

			state.items = state.items.filter((i) => i.count > 0);
		},
		resetBooking: () => initialState,
	},
});

export const { setAccommodationId, setGuestCount, setDates, setLeader, setBookingField, setBookingInfo, updateRoomQuantity, resetBooking } = bookingSlice.actions;
export default bookingSlice.reducer;
