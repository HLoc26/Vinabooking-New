import { CreateReviewPayload } from "../types/Review";
import { PrismaClient } from "../../generated/prisma/client";

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
}
export default ReviewRepository;
