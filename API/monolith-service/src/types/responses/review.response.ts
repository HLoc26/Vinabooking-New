export interface ReviewResponse {
	id: string;
	star: number;
	comment: string;
	user: {
		id: string;
		name: string;
		avatar: string;
	};
	children: ReviewResponse[];
	commentDate: Date;
}
