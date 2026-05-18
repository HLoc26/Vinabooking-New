export type BookingDetail = {
	id: string;
	count: 1;
	note: string;
	bookingId: string;
	itemId: string;
	itemType: "ROOM" | "BED";
};

export type PaymentTransfer = {
	id: string;
	bookingId: string;
	transferReference: string | null;
	amount: string;
	currency: string;
	transferContent: string;
	paymentLinkId: string | null;
	status: "PENDING" | "DISMISSED" | "FAILED" | "COMPLETED" | "PARTIALLY_HALFED" | "PARTIALLY_THIRDED" | "PARTIALLY_QUARTERED";
	receivedAt: string | null;
	completedAt: string | null;
	createdAt: string;
	updatedAt: string;
};

export type Booking = {
	id: string;
	startDate: Date | string;
	endDate: Date | string;
	guestCount: number;
	leaderName: string | null;
	leaderEmail: string | null;
	totalPrice: string | null;
	phone: string;
	referenceNo: number;
	status: "DRAFT" | "PENDING" | "CANCELLED" | "BOOKED" | "COMPLETED";
	userId: string;
	details: BookingDetail[];
	paymentTransfers: PaymentTransfer[];
	createdAt: Date;
};
