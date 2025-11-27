import type { EAccommodationType } from "./Accommodation";

export type Guests = {
	adults: number;
	children: number;
	rooms: number;
};

export type Dates = {
	checkIn: Date;
	checkOut: Date | null;
};

export type Query = {
	keyword: string;
	dates: Dates;
	guests: Guests;
	type?: EAccommodationType;
};
