import type { Prisma, PrismaClient } from "@prisma/client/extension";
import PrismaSingleton from "../clients/PrismaSingleton";

class FavouriteRepository {
	private prismaClient = PrismaSingleton.getInstance();

	public async createDefaultList(userId: string, tx: PrismaClient | Prisma.TransactionClient = this.prismaClient) {
		return await tx.favouriteList.create({
			data: {
				name: "My Favourite List",
				ownerId: userId,
			},
		});
	}
}

export default FavouriteRepository;
