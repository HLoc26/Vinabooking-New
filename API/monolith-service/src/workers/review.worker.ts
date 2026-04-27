import { getEmbeddingModel } from "@/clients/gemini.client";
import { pineconeIndex } from "@/clients/pinecone.client";
import { EReviewJobName, ReviewJobData } from "@/types/review.types";
import { aiLimiter } from "@/utils/ai-limiter";
import { Job } from "bullmq";
import { ESentiment, IBaseWorker } from "./types";

export class ReviewWorker implements IBaseWorker {
	public readonly queueName = "ai-task";
	public readonly concurrency = 2;

	public async process(job: Job): Promise<void> {
		// Add more job handlers here in the future
		// case EReviewJobName.SUMMARIZE_REVIEWS:
		//     await this.handleSummarization(job.data);
		//     break;
		switch (job.name) {
			case EReviewJobName.PROCESS_TO_VECTORS.toString():
				await this.#handleReviewIngestion(job.data);
				break;

			default:
				console.warn(`[ReviewWorker] Unknown job name: ${job.name}`);
		}
	}

	async #handleReviewIngestion(data: ReviewJobData): Promise<void> {
		const { reviewId, accommodationId, text, rating } = data;
		console.log(`[AI Worker] Start ingesting review ${reviewId}`);

		if (!text || text.length < 10) {
			console.log(`Skipping short reviews ${reviewId}`);
			return;
		}

		const cleanedText: string = this.#processText(text);
		const sentiment: ESentiment = this.#getSentiment(rating);
		const chunkedText: string[] = this.#chunkText(cleanedText, 600, 100);

		const vectors = await this.#prepareVectors(data, chunkedText, sentiment);

		await pineconeIndex.namespace(accommodationId).upsert({
			records: vectors,
		});

		console.log(`[AI Worker] Successfully ingested review ${reviewId} into Pinecone (${vectors.length} vectors)`);
	}

	#processText(text: string): string {
		return text
			.toLowerCase()
			.trim()
			.replace(/[^\w\s]/g, "");
	}

	#getSentiment(rating: number): ESentiment {
		switch (rating) {
			case 5:
				return ESentiment.HIGHLY_POSITIVE;
			case 4:
				return ESentiment.POSITIVE;
			case 3:
				return ESentiment.NEUTRAL;
			case 2:
				return ESentiment.NEGATIVE;
			case 1:
				return ESentiment.HIGHLY_NEGATIVE;
			default:
				return ESentiment.NEUTRAL;
		}
	}

	#chunkText(text: string, maxLength: number, offset: number): string[] {
		const chunks: string[] = [];
		if (text.length > maxLength) {
			for (let i = 0; i < text.length; i += maxLength - offset * 2) {
				chunks.push(text.substring(i, i + maxLength - offset));
			}
		} else {
			chunks.push(text);
		}
		return chunks;
	}

	async #prepareVectors(data: ReviewJobData, chunks: string[], sentiment: ESentiment) {
		const vectors = [];

		for (let i = 0; i < chunks.length; i++) {
			const chunkedText = chunks[i];
			const embedding = await aiLimiter(() => getEmbeddingModel().embedContent(chunkedText));

			vectors.push({
				id: chunks.length > 1 ? `${data.reviewId}-${i}` : data.reviewId,
				values: embedding.embedding.values,
				metadata: {
					reviewId: data.reviewId,
					text: data.text.substring(0, 1000),
					rating: data.rating,
					sentiment: sentiment.toString(),
					createdAt: new Date().toISOString(),
				},
			});
		}
		return vectors;
	}
}
