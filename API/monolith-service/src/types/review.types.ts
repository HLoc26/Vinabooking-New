export interface ReviewJobData {
	reviewId: string;
	accommodationId: string;
	text: string;
	rating: number;
}

export enum EReviewJobName {
	PROCESS_TO_VECTORS = "process-review",
}
