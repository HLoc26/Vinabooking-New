export interface ReviewResponse {
	id: string;
	star: number;
	comment: string;
	bookingId: string | null;
	user: {
		id: string;
		name: string;
		avatar: string;
	};
	children: ReviewResponse[];
	commentDate: Date;
}
