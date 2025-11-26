// Booking.ts
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
	details: {
		create: BookingDetailPayload[];
	};
	phone: string;
	leaderName: string;
	leaderEmail: string;
}

export type CreateBookingInput = BookingPayload & { userId: string; referenceNo: number; status: "DRAFT" | "PENDING" | "CANCELLED" | "BOOKED" | "COMPLETED" };
export interface ConfirmPayload {
	id: string;
}
