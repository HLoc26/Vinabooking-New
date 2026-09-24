export enum BookingStatus {
	DRAFT = "DRAFT",
	PENDING = "PENDING",
	CANCELLED = "CANCELLED",
	BOOKED = "BOOKED",
	COMPLETED = "COMPLETED",
}

export enum CancellationSource {
	OWNER = "OWNER",
	TRAVELLER = "TRAVELLER",
	SYSTEM = "SYSTEM",
}

export enum BookingItemType {
	ROOM = "ROOM",
	BED = "BED",
}
