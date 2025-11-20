// Booking.ts
export interface BookingDetailPayload {
	itemId: string;
	itemType: "ROOM" | "BED";
	count: number;
	note?: string;
}

export interface BookingPayload {
	startDate: string; // ISO 8601 string
	endDate: string;
	guestCount: number;
	details: {
		create: BookingDetailPayload[];
	};
	phone: string;
	leaderName: string;
	leaderEmail: string;
}
export interface ConfirmPayload {
	id: string;
}
