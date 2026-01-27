import { CreateReviewPayload } from "../types/Review";
import { PrismaClient } from "../../src/generated/client";

class ReviewRepository {
	constructor(private prisma: PrismaClient) {}

	public async create(reviewData: CreateReviewPayload, userId: string) {
		return this.prisma.review.create({
			data: {
				...reviewData,
				userId,
			},
		});
	}

	public async findParentById(id: string) {
		return this.prisma.review.findUnique({ where: { id, parent: null } });
	}

	public async findByAccommodationId(accommodationId: string) {
		return this.prisma.review.findMany({ where: { accommodationId } });
	}

	public async findByUserId(userId: string) {
		return this.prisma.review.findMany({ where: { userId } });
	}
}
export default ReviewRepository;
