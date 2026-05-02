import { AccommodationService, SearchService } from "@/services";
import { SemanticSearchRequest } from "@/types/requests/search.requests";
import ResponseHelper from "@/utils/response";
import { Request, Response } from "express";

class SearchController {
	readonly #searchService: SearchService;
	readonly #accommodationService: AccommodationService;

	constructor(searchService: SearchService, accommodationService: AccommodationService) {
		this.#searchService = searchService;
		this.#accommodationService = accommodationService;
	}

	public async semanticSearch(req: SemanticSearchRequest, res: Response) {
		const { q: query, l: location } = req.query;

		const matches = await this.#searchService.semanticSearch(query, location);

		if (!matches) {
			// Fallback: empty array
			return ResponseHelper.success(res, []);
		}

		const ids = matches.map((a) => a.accommodationId);

		const accommodations = await this.#accommodationService.getAccommodationsBatch(ids);

		return ResponseHelper.success(res, accommodations);
	}
}

export default SearchController;
