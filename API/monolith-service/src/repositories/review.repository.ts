import { PrismaClient, Prisma } from "../../src/generated/client";

class ReviewRepository {
	constructor(private readonly prisma: PrismaClient) {}

	// ---------- create ----------
	public async create(data: Prisma.ReviewUncheckedCreateInput) {
		return this.prisma.review.create({ data });
	}

	public async findParentById(id: string) {
		return this.prisma.review.findFirst({
			where: {
				id,
				parentId: null,
			},
		});
	}

	// ---------- find by accommodation ----------
	public async findByAccommodationId(accommodationId: string) {
		return this.prisma.review.findMany({
			where: { accommodationId },
			orderBy: { createdAt: "desc" },
		});
	}

	// ---------- find by user ----------
	public async findByUserId(userId: string) {
		return this.prisma.review.findMany({
			where: { userId },
			orderBy: { createdAt: "desc" },
		});
	}
}

export default ReviewRepository;
