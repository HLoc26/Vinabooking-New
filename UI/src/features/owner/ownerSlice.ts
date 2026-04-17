import { createSlice, nanoid } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
/* ─── Types ───────────────────────────────────────────── */

export type RentalType = "entire_place" | "private_room" | "shared_room";

export type AccommodationType = "apartment" | "hotel" | "villa" | "resort" | "unique";

export interface Address {
	fullAddress: string;
	street: string;
	city: string;
	country: string;
	latitude: number | null;
	longitude: number | null;
}

export interface FacilityConfig {
	facilityId: string;
	fee: number;
	note?: string;
}

export interface Bed {
	name: string;
	bedType: string;
}

export interface Room {
	// tempId used BEFORE backend returns real id
	tempId: string;
	id?: string;

	name: string;
	price: number;
	quantity: number;

	beds: Bed[];
	amenityIds: string[];
}

export interface ImageItem {
	id?: string; // from backend
	url?: string;

	target: "accommodation" | "room";
	roomTempId?: string;
	roomId?: string;
}

export interface ListingDraftState {
	// Step 2
	rentalType: RentalType | null;
	accommodationType: AccommodationType | null;
	name: string;
	description: string;

	// CRITICAL
	accommodationId?: string;

	// Step 3
	address?: Address;

	// Step 4
	facilities: FacilityConfig[];

	// Step 5
	rooms: Room[];

	// Step 6
	images: ImageItem[];
}

/* ─── Initial State ───────────────────────────────────── */

const initialState: ListingDraftState = {
	rentalType: null,
	accommodationType: null,
	name: "",
	description: "",
	facilities: [],
	rooms: [],
	images: [],
};

/* ─── Slice ───────────────────────────────────────────── */

const listingDraftSlice = createSlice({
	name: "listingDraft",
	initialState,
	reducers: {
		/* ── Step 2: Basic Info ───────────────── */

		setBasicInfo(
			state,
			action: PayloadAction<{
				rentalType: RentalType;
				accommodationType: AccommodationType;
				name: string;
				description: string;
			}>
		) {
			state.rentalType = action.payload.rentalType;
			state.accommodationType = action.payload.accommodationType;
			state.name = action.payload.name;
			state.description = action.payload.description;
		},

		setAccommodationId(state, action: PayloadAction<string>) {
			state.accommodationId = action.payload;
		},

		/* ── Step 3: Address ─────────────────── */

		setAddress(state, action: PayloadAction<Address>) {
			state.address = action.payload;
		},

		/* ── Step 4: Facilities ──────────────── */

		setFacilities(state, action: PayloadAction<FacilityConfig[]>) {
			state.facilities = action.payload;
		},

		/* ── Step 5: Rooms ───────────────────── */

		addRoom: {
			reducer(state, action: PayloadAction<Room>) {
				state.rooms.push(action.payload);
			},
			prepare(room: Omit<Room, "tempId">) {
				return {
					payload: {
						...room,
						tempId: nanoid(), // generate temp ID
					},
				};
			},
		},

		updateRoom(state, action: PayloadAction<Room>) {
			const index = state.rooms.findIndex((r) => r.tempId === action.payload.tempId);
			if (index !== -1) {
				state.rooms[index] = action.payload;
			}
		},

		deleteRoom(state, action: PayloadAction<string>) {
			state.rooms = state.rooms.filter((r) => r.tempId !== action.payload);
		},

		// After API returns real roomId
		setRoomId(state, action: PayloadAction<{ tempId: string; roomId: string }>) {
			const room = state.rooms.find((r) => r.tempId === action.payload.tempId);
			if (room) {
				room.id = action.payload.roomId;
			}
		},

		/* ── Step 6: Images ─────────────────── */

		addImages(state, action: PayloadAction<ImageItem[]>) {
			state.images.push(...action.payload);
		},

		removeImage(state, action: PayloadAction<string>) {
			state.images = state.images.filter((img) => img.url !== action.payload);
		},

		/* ── Reset ──────────────────────────── */

		resetDraft() {
			return initialState;
		},
	},
});

/* ─── Exports ─────────────────────────────────────────── */

export const { setBasicInfo, setAccommodationId, setAddress, setFacilities, addRoom, updateRoom, deleteRoom, setRoomId, addImages, removeImage, resetDraft } = listingDraftSlice.actions;

export default listingDraftSlice.reducer;
