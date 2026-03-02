import { PrismaClient, Prisma, Review } from "@/generated/client";

class ReviewRepository {
	readonly #prisma: PrismaClient;

	constructor(prismaClient: PrismaClient) {
		this.#prisma = prismaClient;
	}

	// ---------- create ----------
	public async create(data: Prisma.ReviewUncheckedCreateInput): Promise<Review> {
		return this.#prisma.review.create({ data });
	}

	// ---------- find parent ----------
	public async findParentById(id: string): Promise<Review | null> {
		return this.#prisma.review.findFirst({
			where: {
				id,
				parentId: null,
			},
		});
	}

	// ---------- find by accommodation ----------
	public async findByAccommodationId(accommodationId: string) {
		return this.#prisma.review.findMany({
			where: {
				accommodationId,
				parentId: null, // only main reviews
			},
			include: {
				user: true,
				replies: {
					include: {
						user: true,
					},
				},
			},
			orderBy: { createdAt: "desc" },
		});
	}

	// ---------- find by user ----------
	public async findByUserId(userId: string): Promise<Review[]> {
		return this.#prisma.review.findMany({
			where: { userId },
			orderBy: { createdAt: "desc" },
		});
	} // I swear I will use them later (never)

	//------------ find by booking and user ----------
	public async findByBookingAndUser(bookingId: string, userId: string) {
		return this.#prisma.review.findFirst({
			where: {
				bookingId,
				userId,
			},
			include: {
				user: true,
			},
		});
	}
}

export default ReviewRepository;
