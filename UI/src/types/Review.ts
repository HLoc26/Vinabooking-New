export interface ReviewData {
	star?: number | null;
	comment: string;
	accommodationId: string;
	bookingId?: string | null;
	parentId?: string | null;
}
