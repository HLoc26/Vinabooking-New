import { AccommodationReviewSummary } from "@/generated/client";
import { ReviewSummaryRepository } from "@/repositories";

class ReviewSummaryService {
	readonly #reviewSummaryRepository: ReviewSummaryRepository;

	constructor(reviewSummaryRepository: ReviewSummaryRepository) {
		this.#reviewSummaryRepository = reviewSummaryRepository;
	}

	public async getSummaryByAccommodation(accommodationId: string): Promise<AccommodationReviewSummary | null> {
		return await this.#reviewSummaryRepository.getSummaryByAccommodation(accommodationId);
	}

	public async upsert(accommodationId: string, content: string): Promise<AccommodationReviewSummary> {
		return await this.#reviewSummaryRepository.upsert(accommodationId, content);
	}
}

export default ReviewSummaryService;
