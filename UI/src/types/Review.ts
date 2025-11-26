export interface ReviewDto {
	star?: number | null;
	comment: string;
	accommodationId: string;
	bookingId?: string | null;
	parentId?: string | null;
}

export type ReviewData = ReviewDto & {
	id: string;
	createdAt: Date | string;
	updatedAt: Date | string;
	userId: string;
	children: ReviewReply[];
	user: {
		id: string;
		name: string;
	};
};

export type ReviewReply = Omit<ReviewData, "bookingId" | "children">;
