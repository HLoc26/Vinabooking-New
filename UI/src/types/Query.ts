import type { EAccommodationType } from "./acommodation";

export type Query = {
	keyword: string;
	checkIn?: string | Date;
	checkOut?: string | Date;
	adults?: number;
	children?: number;
	rooms?: number;
	type?: EAccommodationType;
};
