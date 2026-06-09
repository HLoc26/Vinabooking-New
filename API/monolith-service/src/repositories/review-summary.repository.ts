import { PrismaClient } from "@/generated/client";
import { AccommodationReviewSummary } from "@/models/review";
import { AccommodationReviewSummaryMapper } from "@/mappers/review.mapper";

class ReviewSummaryRepository {
	readonly #prisma: PrismaClient;

	constructor(prisma: PrismaClient) {
		this.#prisma = prisma;
	}

	async getSummaryByAccommodation(accommodationId: string): Promise<AccommodationReviewSummary | null> {
		const result = await this.#prisma.accommodationReviewSummary.findUnique({
			where: { accommodationId },
		});
		return result ? AccommodationReviewSummaryMapper.toDomain(result) : null;
	}

	async upsert(domainSummary: AccommodationReviewSummary): Promise<AccommodationReviewSummary> {
		const data = AccommodationReviewSummaryMapper.toPersistence(domainSummary);
		const result = await this.#prisma.accommodationReviewSummary.upsert({
			where: { accommodationId: data.accommodationId },
			update: { content: data.content },
			create: { accommodationId: data.accommodationId, content: data.content, id: data.id },
		});
		return AccommodationReviewSummaryMapper.toDomain(result);
	}
}

export default ReviewSummaryRepository;
