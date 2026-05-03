import { getEmbeddingModel } from "@/clients/gemini.client";
import { pineconeIndex, UnifiedRecordMetadata } from "@/clients/pinecone.client";
import { redisClient } from "@/registry";
import { AccommodationMatchStats, BoundingBox, MatchReasonType } from "@/types/search.types";
import { aiLimiter } from "@/utils/ai-limiter";
import { ScoredPineconeRecord } from "@pinecone-database/pinecone";

import crypto from "crypto";

/**
 * Service for semantic search and AI stuff
 */
class SearchService {
	async semanticSearch(query: string, box: BoundingBox): Promise<AccommodationMatchStats[]> {
		try {
			if (!query || query.trim() === "") {
				return [];
			}

			const queryHash = this.#createQueryHash(query, box);

			const cacheKey = `semantic_search:${queryHash}`;

			const cachedResults = await redisClient.GET(cacheKey);

			if (cachedResults) {
				console.log(`[CACHE HIT] Semantic Search: ${query} in [${box.minLat}, ${box.maxLat}, ${box.minLon}, ${box.maxLon}]`);
				return JSON.parse(cachedResults) as AccommodationMatchStats[];
			}

			console.log(`[CACHE MISS] Executing full pipeline for: ${query} in [${box.minLat}, ${box.maxLat}, ${box.minLon}, ${box.maxLon}]`);

			const vector = await this.#vectorizeIntent(query);

			const matches = await this.#queryVectorDb(vector, box);

			const matchStats = this.#aggregateScores(matches);

			// Search by finalScore
			matchStats.sort((a, b) => b.finalScore - a.finalScore);

			await redisClient.SET(cacheKey, JSON.stringify(matchStats), {
				EX: 600,
			});

			return matchStats;
		} catch (error) {
			console.error(`[Semantic Search] Error when search with query: ${query}\nBox: ${JSON.stringify(box)}`);
			return [];
		}
	}

	/**
	 * Create unique hash for query:location pair
	 */
	#createQueryHash(query: string, box: BoundingBox): string {
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
		const boxString = `${box.minLat},${box.maxLat},${box.minLon},${box.maxLon}`;

		const rawString = `${boxString}::${normalizedQuery}`;

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
				bestReviewText: string;
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
					bestReviewText: "",
				});
			}

			const data = grouped.get(accId)!;

			if (metadata.type === "accommodation-profile") {
				data.profileScore = Math.max(data.profileScore, score);
			} else if (metadata.type === "review") {
				data.reviewCount += 1;
				if (score > data.maxReviewScore) {
					data.maxReviewScore = score;
					data.bestReviewText = metadata.text ?? "";
				}
			}
		}

		return Array.from(grouped.entries()).map(([accommodationId, data]) => {
			const finalScore = data.profileScore * WEIGHTS.PROFILE + data.maxReviewScore * WEIGHTS.REVIEW + data.reviewCount * WEIGHTS.REVIEW_COUNT_BONUS;

			const matchReasonType: MatchReasonType = data.maxReviewScore > 0 && data.bestReviewText.trim() !== "" ? "review" : "profile";

			const matchReason =
				data.maxReviewScore > 0 && data.bestReviewText.trim() !== "" //
					? `${data.bestReviewText.trim()}`
					: "Matches accommodation information and amenities";

			return {
				accommodationId,
				finalScore,
				stats: {
					maxReviewScore: data.maxReviewScore,
					profileScore: data.profileScore,
					reviewCount: data.reviewCount,
					matchReason,
					matchReasonType,
				},
			};
		});
	}

	async #queryVectorDb(vector: number[], box: BoundingBox): Promise<ScoredPineconeRecord<UnifiedRecordMetadata>[]> {
		const filter = {
			lat: { $gte: box.minLat, $lte: box.maxLat },
			lon: { $gte: box.minLon, $lte: box.maxLon },
		};

		const [profileResponse, reviewResponse] = await Promise.all([
			// Query 1: Getting Top 15 Accomm profile
			pineconeIndex.query({
				vector: vector,
				topK: 15,
				includeMetadata: true,
				filter: {
					...filter,
					type: "accommodation-profile", // only get profile
				},
			}),

			// Query 2: Getting Top 35 Review
			pineconeIndex.query({
				vector: vector,
				topK: 35,
				includeMetadata: true,
				filter: {
					...filter,
					type: "review", // only get reviews
				},
			}),
		]);

		return [...profileResponse.matches, ...reviewResponse.matches];
	}

	async #vectorizeIntent(intent: string): Promise<number[]> {
		const result = await aiLimiter(() => getEmbeddingModel().embedContent(intent));
		return result.embedding.values;
	}
}

export default SearchService;
