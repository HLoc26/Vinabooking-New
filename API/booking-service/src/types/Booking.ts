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
	userId: string;
	referenceNo: number;
	phone: string;
	details: {
		create: BookingDetailPayload[];
	};
}
