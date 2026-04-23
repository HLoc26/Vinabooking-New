import { Worker, Job } from "bullmq";
import { redisConnection } from "../clients/queue.client";
import { getEmbeddingModel, getGeminiModel } from "../clients/gemini.client";
import { pineconeIndex } from "../clients/pinecone.client";
import { aiLimiter } from "../utils/ai-limiter";
import prisma from "../clients/prisma.client";

interface ReviewJobData {
	reviewId: string;
	accommodationId: string;
	text: string;
	rating: number;
}

const handleReviewIngestion = async (data: ReviewJobData) => {
	const { reviewId, accommodationId, text, rating } = data;

	if (!text || text.length < 10) {
		console.log(`[AI Worker] Skipping short review: ${reviewId}`);
		return;
	}

	// 1. Pre-processing
	const cleanText = text
		.toLowerCase()
		.trim()
		.replace(/[^\w\s]/g, "");

	// 2. Deterministic Sentiment
	let sentiment = "neutral";
	if (rating === 5) sentiment = "highly_positive";
	else if (rating === 4) sentiment = "positive";
	else if (rating === 3) sentiment = "neutral";
	else if (rating === 2) sentiment = "negative";
	else if (rating === 1) sentiment = "highly_negative";

	// 3. Chunking & Embedding
	const chunks: string[] = [];
	if (cleanText.length > 600) {
		for (let i = 0; i < cleanText.length; i += 400) {
			chunks.push(cleanText.substring(i, i + 500));
		}
	} else {
		chunks.push(cleanText);
	}

	const vectorsToUpsert = [];

	for (let i = 0; i < chunks.length; i++) {
		const chunkText = chunks[i];
		const embedding = await aiLimiter(() => getEmbeddingModel().embedContent(chunkText));

		vectorsToUpsert.push({
			id: chunks.length > 1 ? `${reviewId}-${i}` : reviewId,
			values: embedding.embedding.values,
			metadata: {
				reviewId,
				text: text.substring(0, 1000), // preserve original text snippet up to 1000 chars
				rating,
				sentiment,
				createdAt: new Date().toISOString(),
			},
		});
	}

	// 4. Pinecone Upsert
	await pineconeIndex.namespace(accommodationId).upsert({
		records: vectorsToUpsert,
	});

	console.log(`[AI Worker] Successfully ingested review ${reviewId} into Pinecone (${vectorsToUpsert.length} vectors)`);

	// 5. Trigger Summarization check
	try {
		await handleSummarization(accommodationId);
	} catch (error) {
		console.error(`[AI Worker] Summarization failed for ${accommodationId}, but ingestion succeeded`, error);
	}
};

const handleSummarization = async (accommodationId: string) => {
	// 1. Freshness Check (1 hour)
	const existingSummary = await prisma.accommodationReviewSummary.findUnique({
		where: { accommodationId },
	});

	if (existingSummary) {
		const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
		if (existingSummary.updatedAt > oneHourAgo) {
			console.log(`[AI Worker] Summary for ${accommodationId} is still fresh. Skipping.`);
			return;
		}
	}

	// 2. Data Retrieval (Top 50 reviews)
	const reviews = await prisma.review.findMany({
		where: { accommodationId, parentId: null },
		take: 50,
		orderBy: { createdAt: "desc" },
		select: { comment: true, star: true },
	});

	if (reviews.length < 3) {
		console.log(`[AI Worker] Not enough reviews to summarize for ${accommodationId}`);
		return;
	}

	const reviewsText = reviews.map((r) => `- [${r.star} stars]: ${r.comment.substring(0, 300)}`).join("\n");

	// 3. Prompt Gemini
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
			contents: [{ role: "user", parts: [{ text: prompt }] }],
			generationConfig: { responseMimeType: "application/json" },
		})
	);

	const response = result.response;
	const textResponse = response.text();

	try {
		// Extract JSON if AI wrapped it in markdown
		const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
		const jsonString = jsonMatch ? jsonMatch[0] : textResponse;
		const parsed = JSON.parse(jsonString);

		if (parsed.summary) {
			// 4. Update Database
			await prisma.accommodationReviewSummary.upsert({
				where: { accommodationId },
				update: { content: parsed.summary },
				create: { accommodationId, content: parsed.summary },
			});
			console.log(`[AI Worker] Successfully updated summary for ${accommodationId}`);
		}
	} catch (error) {
		console.error("[AI Worker] Failed to parse summary JSON", error, textResponse);
	}
};

const aiWorker = new Worker(
	"ai-task",
	async (job: Job) => {
		console.log(`[AI Worker] Processing job ${job.id} (${job.name})`);
		if (job.name === "process-review") {
			await handleReviewIngestion(job.data);
		}
	},
	{
		connection: redisConnection,
		concurrency: 5,
	}
);

aiWorker.on("failed", (job, err) => {
	console.error(`[AI Worker] Job ${job?.id} failed: ${err.message}`);
});

export default aiWorker;
