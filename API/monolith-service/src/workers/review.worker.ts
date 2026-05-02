import { getEmbeddingModel, getGeminiModel } from "@/clients/gemini.client";
import { pineconeIndex, ReviewRecordMetadata } from "@/clients/pinecone.client";
import { EReviewJobName, ReviewJobData, SummaryReviewJobData } from "@/types/review.types";
import { aiLimiter } from "@/utils/ai-limiter";
import { Job } from "bullmq";
import { ESentiment, IBaseWorker } from "./types";
import { ReviewService, ReviewSummaryService } from "@/services";
import { AccommodationReviewSummary, Review } from "@/generated/client";
import redisClient from "@/clients/redis.client";
export class ReviewWorker implements IBaseWorker {
	public readonly queueName = "ai-task";
	public readonly concurrency = 2;
	readonly #reviewSummaryService: ReviewSummaryService;
	readonly #reviewService: ReviewService;

	constructor(reviewSummaryService: ReviewSummaryService, reviewService: ReviewService) {
		this.#reviewSummaryService = reviewSummaryService;
		this.#reviewService = reviewService;
	}

	public async process(job: Job<ReviewJobData>): Promise<void> {
		switch (job.name) {
			case EReviewJobName.PROCESS_TO_VECTORS.toString():
				await this.#handleReviewIngestion(job.data);
				break;
			case EReviewJobName.SUMMARIZE_REVIEWS:
				await this.#handleSummarization(job.data);
				break;
			default:
				console.warn(`[ReviewWorker] Unknown job name: ${job.name}`);
		}
	}

	// ==========================
	// |	Review Summary		|
	// ==========================

	async #handleSummarization(data: SummaryReviewJobData) {
		const { accommodationId } = data;
		console.log(`[AI Worker] Starting summary for ${accommodationId}`);

		const summaryInDb: AccommodationReviewSummary | null = await this.#reviewSummaryService.getSummaryByAccommodation(accommodationId);

		if (summaryInDb && this.#isUpdatedWithinLastHour(summaryInDb.updatedAt)) {
			console.log(`[AI Worker] Summary for ${accommodationId} is still fresh. Skipping.`);
			return;
		}

		const reviewCountRedisKey = `accommodation:${accommodationId}:review:count`;

		const newReviewCountFromRedis = await redisClient.GET(reviewCountRedisKey);
		if (newReviewCountFromRedis && Number.parseInt(newReviewCountFromRedis) < 10) {
			console.log(`[AI Worker] Not enough reviews to summarize for ${accommodationId}`);
			return;
		}

		const reviews: Review[] = await this.#reviewService.getRecentParentReviews(accommodationId, 50);
		await redisClient.SET(reviewCountRedisKey, reviews.length);

		if (reviews.length < 10) {
			console.log(`[AI Worker] Not enough reviews to summarize for ${accommodationId}`);
			return;
		}

		// If already exists summary in Db, only summarize if new review count >= 10
		if (summaryInDb) {
			const newReviewCount = reviews.filter((r) => r.updatedAt > summaryInDb.updatedAt).length;
			if (newReviewCount < 3) {
				return;
			}
		}

		const reviewsText = reviews.map((r) => `- [${r.star ?? 0} stars]: ${r.comment.substring(0, 300)}`).join("\n");

		const response = await this.#doSummarizeByAI(reviewsText);

		const textResponse = response.text();

		const parsed: { summary: string } = this.#extractJson(textResponse);

		if (parsed.summary.length > 0) {
			// 4. Update Database
			await this.#reviewSummaryService.upsert(accommodationId, parsed.summary);
			console.log(`[AI Worker] Successfully updated summary for ${accommodationId}`);
		}
	}

	async #doSummarizeByAI(reviewsText: string) {
		const prompt = `
You are an expert travel analyst. Summarize these reviews for this accommodation. 
Focus on pros, cons, and the overall vibe. 
Keep it concise (max 3-4 sentences).
Output MUST be a concise JSON object: { "summary": "..." }

Reviews:
${reviewsText}
	`;

		const result = await aiLimiter(() =>
			getGeminiModel().generateContent({
				contents: [{ role: "User", parts: [{ text: prompt }] }],
				generationConfig: { responseMimeType: "application/json" },
			})
		);

		return result.response;
	}

	#extractJson(text: string): { summary: string } {
		try {
			// Extract JSON if AI wrapped it in markdown
			const jsonMatch = text.match(/\{[\s\S]*\}/);
			const jsonString = jsonMatch ? jsonMatch[0] : text;
			const parsed = JSON.parse(jsonString);
			return parsed;
		} catch (error) {
			console.error("[AI Worker] Failed to parse summary JSON", error, text);
			return { summary: "" };
		}
	}

	#isUpdatedWithinLastHour(updatedAt: Date | string | number): boolean {
		const dateToCheck = new Date(updatedAt).getTime();
		const now = new Date().getTime();

		const ONE_HOUR_IN_MS = 60 * 60 * 1000;

		return now - dateToCheck <= ONE_HOUR_IN_MS && now - dateToCheck >= 0;
	}

	// ==========================
	// |	Review Upsert		|
	// ==========================

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

		await pineconeIndex.upsert({
			records: vectors,
		});

		console.log(`[AI Worker] Successfully ingested review ${reviewId} into Pinecone (${vectors.length} vectors)`);
	}

	#processText(text: string): string {
		return text.toLowerCase().trim();
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
		const vectors: { id: string; values: number[]; metadata: ReviewRecordMetadata }[] = [];

		const embeddingModel = getEmbeddingModel();

		for (let i = 0; i < chunks.length; i++) {
			const chunkedText = chunks[i];
			const embedding = await aiLimiter(() => embeddingModel.embedContent(chunkedText));

			vectors.push({
				id: chunks.length > 1 ? `${data.reviewId}-${i}` : data.reviewId,
				values: embedding.embedding.values,
				metadata: {
					reviewId: data.reviewId,
					text: data.text.substring(0, 1000),
					accommodationId: data.accommodationId,
					type: "review",
					city: data.city,
					rating: data.rating,
					sentiment: sentiment.toString(),
					createdAt: data.createdAt,
				},
			});
		}
		return vectors;
	}
}
