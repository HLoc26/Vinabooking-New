import { Accommodation, EItemType } from "@/generated/client";
import { AccommodationFullInfo } from "./accommodation.types";

export interface ConfirmationEmailData {
	to: string;
	accommodation: AccommodationFullInfo;
	checkIn: string;
	checkOut: string;

	guestName?: string;
	referenceNo?: number;
	roomType?: EItemType | string;
	guestCount?: number;
	nights?: number;
	specialRequest?: string;
	totalCharge?: string;
}

export interface CancellationEmailData {
	to: string;
	accommodation: Accommodation;
	guestName?: string;
	referenceNo?: number;
	roomType?: EItemType | string;
	nights?: number;
}
