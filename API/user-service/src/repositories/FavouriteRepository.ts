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

	public async addAccommodationToFavouriteList(userId: string, listId: string, accommodationId: string) {
		const list = await this.prismaClient.favouriteList.findUnique({
			where: { id: listId },
			include: { owner: true, items: true },
		});

		if (!list) throw new Error("Favourite list not found");
		if (list.ownerId !== userId) throw new Error("This list does not belong to the user");

		const existingItem = list.items.find((item) => item.accommodationId === accommodationId);
		if (existingItem) throw new Error("Accommodation already in favourite list");

		const newItem = await this.prismaClient.favouriteItem.create({
			data: {
				listId,
				accommodationId,
			},
		});

		return newItem;
	}

	public async removeAccommodationFromFavouriteList(userId: string, listId: string, accommodationId: string) {
		// Check if user owns the list
		const list = await this.prismaClient.favouriteList.findFirst({ where: { id: listId } });

		if (!list) {
			throw new Error("Favourite List not found");
		}
		if (list.ownerId != userId) {
			throw new Error("User does not own this list");
		}

		const found = await this.prismaClient.favouriteItem.findFirst({
			where: {
				listId,
				accommodationId,
			},
		});

		if (!found) {
			throw new Error("Accommodation is not in list");
		}
		try {
			await this.prismaClient.favouriteItem.delete({ where: { id: found.id } });
		} catch (e: unknown) {
			const error = e as Error;
			throw new Error(error.message);
		}
	}
}

export default FavouriteRepository;
