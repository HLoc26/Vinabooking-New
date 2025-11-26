export const EItemType = {
	ROOM: "ROOM",
	BED: "BED",
} as const;
export type EItemType = (typeof EItemType)[keyof typeof EItemType];

export const EBookingStatus = {
	DRAFT: "DRAFT",
	PENDING: "PENDING",
	CANCELLED: "CANCELLED",
	BOOKED: "BOOKED",
	COMPLETED: "COMPLETED",
} as const;
export type EBookingStatus = (typeof EBookingStatus)[keyof typeof EBookingStatus];

export type BookingDetail = {
	id: string;
	createdAt: Date;
	updatedAt: Date;
	count: number;
	note: string | null;
	itemId: string;
	itemType: EItemType;
	bookingId: string;
};

export type BookingPayload = {
	details: BookingDetail[];
} & {
	id: string;
	startDate: Date;
	endDate: Date;
	guestCount: number;
	leaderName: string | null;
	leaderEmail: string | null;
	totalPrice: string | number | null;
	phone: string | null;
	referenceNo: number;
	status: EBookingStatus;
	userId: string;
	createdAt: Date;
	updatedAt: Date;
};
