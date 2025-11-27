import type { EAccommodationType } from "./Accommodation";

export type Guests = {
	adults: number;
	children: number;
	rooms: number;
};

export type Dates = {
	checkIn?: string | Date;
	checkOut?: string | Date;
};

export type Query = {
	keyword: string;
	dates?: Dates;
	guests?: Guests;
	type?: EAccommodationType;
};
