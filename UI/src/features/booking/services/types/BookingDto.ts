export interface ItemDetail {
	id: string;
	name: string;
	type: "ROOM" | "BED";
	price: number;
	note?: string;
	count: number;
	//roomImage: file?
}

export interface BookingDto {
	id: string;
	startDate: Date;
	endDate: Date;
	guestCount: number;
	referenceNo: number;
	user: {
		name: string;
		email: string;
		phone: string;
		id: string;
	};
	accommodation: {
		name: string;
		address: string;
		//image: file?
	};
	room: ItemDetail[];
}
