type ItemInfo = {
	id: string;
	itemType: "ROOM" | "BED";
	count: number;
};

export type BookingContextInfo = {
	startDate: Date;
	endDate: Date;
	guestCount: number;
	accommodationId: string;
	items: ItemInfo[];
};
