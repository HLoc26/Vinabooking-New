export interface Review {
	id: string;
	star: number;
	comment: string;
	bookingId: string;
	user: {
		id: string;
		name: string;
		avatar: string;
	};
	children: Review[];
	commentDate: Date;
}
