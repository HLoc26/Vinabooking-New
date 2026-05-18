import { Request } from "express";

export interface ConfirmPayload {
	id: string;
}
export type ConfirmRequest = Request<object, object, ConfirmPayload>;

export interface BookingDetailPayload {
	itemId: string;
	itemType: "ROOM" | "BED";
	count: number;
	note?: string;
}

export interface BookingPayload {
	startDate: Date; // ISO 8601 string
	endDate: Date;
	guestCount: number;
	// Anti-tamper: FE echoes back the hash from POST /pricing/quote.
	// BE re-quotes and rejects 409 if the hash doesn't match (price changed).
	quoteHash: string;
	details: {
		create: BookingDetailPayload[];
	};
	phone: string;
	leaderName: string;
	leaderEmail: string;
}

export type BookingRequest = Request<unknown, object, BookingPayload>;
