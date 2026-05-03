import { AccommodationService, SearchService } from "@/services";
import { SemanticSearchRequest } from "@/types/requests/search.requests";
import { ApiResponse } from "@/types/responses";
import { SemanticSearchResponse } from "@/types/responses/search.response";
import ResponseHelper from "@/utils/response";
import { Request, Response } from "express";

class SearchController {
	readonly #searchService: SearchService;
	readonly #accommodationService: AccommodationService;

	constructor(searchService: SearchService, accommodationService: AccommodationService) {
		this.#searchService = searchService;
		this.#accommodationService = accommodationService;
	}

	public async semanticSearch(req: SemanticSearchRequest, res: Response<ApiResponse<SemanticSearchResponse>>) {
		const { q: query, minLat, maxLat, minLon, maxLon } = req.query;

		const matches = await this.#searchService.semanticSearch(query, {
			minLat: parseFloat(minLat),
			maxLat: parseFloat(maxLat),
			minLon: parseFloat(minLon),
			maxLon: parseFloat(maxLon),
		});

		if (!matches || matches.length === 0) {
			return ResponseHelper.success(res, []);
		}

		const ids = matches.map((a) => a.accommodationId);

		const accommodations = await this.#accommodationService.getAccommodationsBatch(ids);

		const accInfoMap = new Map(accommodations.map((acc) => [acc.id, acc]));

		const enrichedResults = matches.reduce((resultArray, match) => {
			const dbInfo = accInfoMap.get(match.accommodationId);

			if (dbInfo) {
				resultArray.push({
					accommodation: dbInfo,

					aiMatchStats: {
						finalScore: match.finalScore,
						maxReviewScore: match.stats.maxReviewScore,
						profileScore: match.stats.profileScore,
						reviewCount: match.stats.reviewCount,
						matchReason: match.stats.matchReason,
						matchReasonType: match.stats.matchReasonType,
					},
				});
			}

			return resultArray;
		}, [] as SemanticSearchResponse[]);

		return ResponseHelper.success(res, enrichedResults);
	}
}

export default SearchController;
