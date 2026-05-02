import { getEmbeddingModel } from "@/clients/gemini.client";
import { pineconeIndex, UnifiedRecordMetadata } from "@/clients/pinecone.client";
import { redisClient } from "@/registry";
import { AccommodationMatchStats } from "@/types/search.types";
import { aiLimiter } from "@/utils/ai-limiter";
import { QueryResponse, ScoredPineconeRecord } from "@pinecone-database/pinecone";

import crypto from "crypto";

/**
 * Service for semantic search and AI stuff
 */
class SearchService {
	async semanticSearch(query: string, location: string): Promise<AccommodationMatchStats[]> {
		try {
			if (!query || query.trim() === "") {
				return [];
			}

			const queryHash = this.#createQueryHash(query, location);

			const cacheKey = `semantic_search:${queryHash}`;

			const cachedResults = await redisClient.GET(cacheKey);

			if (cachedResults) {
				console.log(`[CACHE HIT] Semantic Search: ${query} in ${location}`);
				return JSON.parse(cachedResults) as AccommodationMatchStats[];
			}

			console.log(`[CACHE MISS] Executing full pipeline for: ${query} in ${location}`);

			const vector = await this.#vectorizeIntent(query);

			const records = await this.#queryVectorDb(vector, location);

			const matchStats = this.#aggregateScores(records.matches);

			// Search by finalScore
			matchStats.sort((a, b) => b.finalScore - a.finalScore);

			await redisClient.SET(cacheKey, JSON.stringify(matchStats), {
				EX: 3600,
			});

			return matchStats;
		} catch (error) {
			console.error(`[Semantic Search] Error when search with query: ${query}\nLocation: ${location}`);
			return [];
		}
	}

	/**
	 * Create unique hash for query:location pair
	 */
	#createQueryHash(query: string, location: string): string {
		// Hàm helper để chuẩn hóa chuỗi
		const sanitize = (str: string) => {
			if (!str) return "";
			return (
				str
					.replace(/[^\p{L}\p{N}\s]/gu, "")
					// remove consecutive spaces
					.replace(/\s+/g, " ")
					.trim()
					.toLowerCase()
			);
		};

		const normalizedQuery = sanitize(query);
		const normalizedLocation = sanitize(location);

		const rawString = `${normalizedLocation}::${normalizedQuery}`;

		return crypto.createHash("sha256").update(rawString).digest("hex");
	}

	#aggregateScores(matches: ScoredPineconeRecord<UnifiedRecordMetadata>[]): AccommodationMatchStats[] {
		const WEIGHTS = {
			PROFILE: 1.0,
			REVIEW: 1.5,
			REVIEW_COUNT_BONUS: 0.05,
		};

		const grouped = new Map<
			string,
			{
				profileScore: number;
				maxReviewScore: number;
				reviewCount: number;
			}
		>();

		for (const match of matches) {
			const metadata = match.metadata!;
			const score = match.score ?? 0;
			const accId = metadata.accommodationId;

			if (!grouped.has(accId)) {
				grouped.set(accId, {
					profileScore: 0,
					maxReviewScore: 0,
					reviewCount: 0,
				});
			}

			const data = grouped.get(accId)!;

			if (metadata.type === "accommodation-profile") {
				data.profileScore = Math.max(data.profileScore, score);
			} else if (metadata.type === "review") {
				data.reviewCount += 1;
				if (score > data.maxReviewScore) {
					data.maxReviewScore = score;
				}
			}
		}

		return Array.from(grouped.entries()).map(([accommodationId, data]) => {
			const finalScore = data.profileScore * WEIGHTS.PROFILE + data.maxReviewScore * WEIGHTS.REVIEW + data.reviewCount * WEIGHTS.REVIEW_COUNT_BONUS;

			return {
				accommodationId,
				finalScore,
				stats: {
					maxReviewScore: data.maxReviewScore,
					profileScore: data.profileScore,
					reviewCount: data.reviewCount,
				},
			};
		});
	}

	async #queryVectorDb(vector: number[], location: string): Promise<QueryResponse<UnifiedRecordMetadata>> {
		return await pineconeIndex.query({
			vector: vector,
			topK: 50,
			includeMetadata: true,
			filter: {
				city: location,
			},
		});
	}

	async #vectorizeIntent(intent: string): Promise<number[]> {
		const result = await aiLimiter(() => getEmbeddingModel().embedContent(intent));
		return result.embedding.values;
	}
}

export default SearchService;
