export type BookingDetail = {
	id: string;
	count: 1;
	note: string;
	bookingId: string;
	itemId: string;
	itemType: "ROOM" | "BED";
};

export type Booking = {
	id: string;
	startDate: Date;
	endDate: Date;
	guestCount: number;
	leaderName: string | null;
	leaderEmail: string | null;
	totalPrice: string | null;
	phone: string;
	referenceNo: number;
	status: "DRAFT" | "PENDING" | "CANCELLED" | "BOOKED" | "COMPLETED";
	userId: string;
	details: BookingDetail[];
};
