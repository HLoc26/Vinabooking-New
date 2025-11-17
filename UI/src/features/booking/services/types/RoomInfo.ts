type Amenity = {
	id: string;
	name: string;
	type: string;
	description: string;
};

type AmenityConfig = {
	id: string;
	note: string;
	amenity: Amenity[];
};

export type RoomInfo = {
	id: string;
	name: string;
	description: string;
	quantity: number;
	size: number;
	price: string; // Endpoint cua Huy tra ve string
	pricingType: string;
	isActive: boolean;
	amenities: AmenityConfig[];
	count?: number;
	note?: string;
	type?: "ROOM" | "BED";
};
