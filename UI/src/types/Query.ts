import type { EAccommodationType } from "./Accommodation";

export type Query = {
	keyword: string;
	checkIn?: string | Date;
	checkOut?: string | Date;
	adults?: number;
	children?: number;
	rooms?: number;
	type?: EAccommodationType;
};
