import { removeStopwords } from "stopword";
import crypto from "crypto";
import { getEmbeddingModel } from "../clients/gemini.client";
import { pineconeIndex } from "../clients/pinecone.client";
import redisClient from "../clients/redis.client";
import { aiLimiter } from "../utils/ai-limiter";

class AIService {
	/**
	 * Normalize query by removing stopwords and hashing for caching.
	 */
	private normalizeQuery(query: string): { normalized: string; hash: string } {
		const words = query
			.toLowerCase()
			.replace(/[^\w\s]/g, "")
			.split(/\s+/);
		const filtered = removeStopwords(words);
		const normalized = filtered.join(" ");
		const hash = crypto.createHash("sha256").update(normalized).digest("hex");
		return { normalized, hash };
	}

	/**
	 * Perform semantic search on reviews for a specific accommodation.
	 */
	public async semanticSearch(accommodationId: string, query: string) {
		const { normalized, hash } = this.normalizeQuery(query);
		const cacheKey = `ai:search:${accommodationId}:${hash}`;

		// 1. Check Redis Cache
		const cached = await redisClient.get(cacheKey);
		if (cached) {
			console.log(`[AI Service] Cache hit for query: "${query}"`);
			return JSON.parse(cached);
		}

		// 2. Get Embedding for the query (Rate Limited)
		const result = await aiLimiter(() =>
			getEmbeddingModel().embedContent(normalized)
		);
		const queryVector = result.embedding.values;

		// 3. Query Pinecone
		const pineconeResults = await pineconeIndex.namespace(accommodationId).query({
			vector: queryVector,
			topK: 10,
			includeMetadata: true,
		});

		// 4. Format Results
		const matches = pineconeResults.matches.map((match) => ({
			reviewId: match.id,
			score: match.score,
			text: match.metadata?.text,
			sentiment: match.metadata?.sentiment,
			rating: match.metadata?.rating,
		}));

		// 5. Cache in Redis (TTL 24 hours)
		await redisClient.set(cacheKey, JSON.stringify(matches), {
			EX: 86400,
		});

		return matches;
	}
}

export default new AIService();
