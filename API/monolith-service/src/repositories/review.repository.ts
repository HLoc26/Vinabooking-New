import { PrismaClient, Prisma } from "@/generated/client";
import { SortOrder } from "@/generated/internal/prismaNamespace";
import { Review } from "@/models/review";
import { ReviewMapper, PrismaReviewWithReplies } from "@/mappers/review.mapper";

class ReviewRepository {
	readonly #prisma: PrismaClient;

	constructor(prismaClient: PrismaClient) {
		this.#prisma = prismaClient;
	}

	// ---------- create ----------
	public async create(domainReview: Review): Promise<Review> {
		const data = ReviewMapper.toPersistence(domainReview);
		const created = await this.#prisma.review.create({ data });
		return ReviewMapper.toDomain(created);
	}

	// ---------- find parent ----------
	public async findParentById(id: string): Promise<Review | null> {
		const result = await this.#prisma.review.findFirst({
			where: {
				id,
				parentId: null,
			},
		});
		return result ? ReviewMapper.toDomain(result) : null;
	}

	// ---------- find by accommodation ----------
	public async findByAccommodationId(accommodationId: string): Promise<Review[]> {
		const results = await this.#prisma.review.findMany({
			where: {
				accommodationId,
				parentId: null, // only main reviews
			},
			include: {
				replies: true,
			},
			orderBy: { createdAt: "desc" },
		});
		return results.map((r) => ReviewMapper.toDomain(r as PrismaReviewWithReplies));
	}

	// ---------- find by user ----------
	public async findByUserId(userId: string): Promise<Review[]> {
		const results = await this.#prisma.review.findMany({
			where: { userId },
			orderBy: { createdAt: "desc" },
		});
		return results.map((r) => ReviewMapper.toDomain(r));
	} 

	//------------ find by booking and user ----------
	public async findByBookingAndUser(bookingId: string, userId: string): Promise<Review | null> {
		const result = await this.#prisma.review.findFirst({
			where: {
				bookingId,
				userId,
			},
		});
		return result ? ReviewMapper.toDomain(result) : null;
	}

	public async findRecentParentReviews(accommodationId: string, top: number): Promise<Review[]> {
		const results = await this.#prisma.review.findMany({
			where: {
				accommodationId,
				parentId: null,
			},
			orderBy: {
				createdAt: SortOrder.desc,
			},
			take: top,
		});
		return results.map((r) => ReviewMapper.toDomain(r));
	}
}

export default ReviewRepository;
