export interface ReviewJobData extends SummaryReviewJobData {
	reviewId: string;
	text: string;
	rating: number;
	city: string;
}

export interface SummaryReviewJobData {
	accommodationId: string;
}

export enum EReviewJobName {
	PROCESS_TO_VECTORS = "process-review",
	SUMMARIZE_REVIEWS = "summarize-review",
}
