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
	totalPrice: number;
	details: {
		create: BookingDetailPayload[];
	};
	phone: string;
	leaderName: string;
	leaderEmail: string;
}

export type BookingRequest = Request<unknown, object, BookingPayload>;
