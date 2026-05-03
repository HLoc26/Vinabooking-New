import { EAccommodationType } from "@/generated/client";

export interface ReviewJobData extends SummaryReviewJobData {
	reviewId: string;
	text: string;
	rating: number;
	lat: number;
	lon: number;
	createdAt: number; // timestamp
}

export interface SummaryReviewJobData {
	accommodationId: string;
}

export enum EReviewJobName {
	PROCESS_TO_VECTORS = "process-review",
	SUMMARIZE_REVIEWS = "summarize-review",
}

export interface PublishJobData {
	accommodationId: string;
	name: string;
	type: EAccommodationType;
	lat: number;
	lon: number;
	description: string;
	facilities: string[];
}

export const PUBLISH_ACCOMMODATION_JOB = "publish-accommodation";
