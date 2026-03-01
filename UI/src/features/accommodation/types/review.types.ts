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
export interface ReviewImage {
	id: string;
	url: string;
	variant: string;
}
// This type is different from Image, I know I know, but Images uses variants, I use variant
export interface ReviewWithImages extends Review {
	images: ReviewImage[];
}
