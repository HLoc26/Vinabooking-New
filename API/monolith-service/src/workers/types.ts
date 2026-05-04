import { Job } from "bullmq";

export interface IBaseWorker {
	queueName: string;
	concurrency?: number;
	process(job: Job): Promise<void>;
}

export enum ESentiment {
	HIGHLY_POSITIVE = "highly_positive",
	POSITIVE = "positive",
	NEUTRAL = "neutral",
	NEGATIVE = "negative",
	HIGHLY_NEGATIVE = "highly_negative",
}
