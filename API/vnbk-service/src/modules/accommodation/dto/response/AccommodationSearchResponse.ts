import { AccommodationResponse } from "@/modules/accommodation/dto/response/AccommodationResponse";

/** Pagination metadata for a search result page. */
export class SearchMeta {
	page!: number;
	limit!: number;
	total!: number;
	totalPages!: number;
}

/** Wire representation of `GET /accommodations/search` — a page of results + meta. */
export class AccommodationSearchResponse {
	data!: AccommodationResponse[];
	meta!: SearchMeta;
}
