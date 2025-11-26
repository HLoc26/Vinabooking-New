export interface ReviewDto {
	star?: number | null;
	comment: string;
	accommodationId: string;
	bookingId?: string | null;
	parentId?: string | null;
}
