import { AccommodationReviewSummary, PrismaClient } from "@/generated/client";

class ReviewSummaryRepository {
	readonly #prisma: PrismaClient;

	constructor(prisma: PrismaClient) {
		this.#prisma = prisma;
	}

	async getSummaryByAccommodation(accommodationId: string): Promise<AccommodationReviewSummary | null> {
		return await this.#prisma.accommodationReviewSummary.findUnique({
			where: { accommodationId },
		});
	}

	async upsert(accommodationId: string, content: string): Promise<AccommodationReviewSummary> {
		return await this.#prisma.accommodationReviewSummary.upsert({
			where: { accommodationId },
			update: { content },
			create: { accommodationId, content },
		});
	}
}

export default ReviewSummaryRepository;
