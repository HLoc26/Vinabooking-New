import { AccommodationReviewSummary, AccommodationReviewSummaryBuilder } from "@/models/review";
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
		const summary = new AccommodationReviewSummaryBuilder()
			.setAccommodationId(accommodationId)
			.setContent(content)
			.build();
			
		return await this.#reviewSummaryRepository.upsert(summary);
	}
}

export default ReviewSummaryService;
