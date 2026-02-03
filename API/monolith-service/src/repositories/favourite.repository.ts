import BadRequestError from "@/errors/BadRequestError";
import NotFoundError from "@/errors/NotFoundError";
import { FavouriteItem, FavouriteList, PrismaClient } from "@/generated/client";
import { PrismaClientKnownRequestError } from "@/generated/internal/prismaNamespace";

class FavouriteRepository {
	readonly #prismaClient: PrismaClient;
	constructor(prismaClient: PrismaClient) {
		this.#prismaClient = prismaClient;
	}

	public async isOwner(listId: string, ownerId: string): Promise<boolean> {
		const count = await this.#prismaClient.favouriteList.count({
			where: {
				id: listId,
				ownerId: ownerId,
			},
		});

		return count > 0;
	}

	public async isAccommodationExistsInList(accommodationId: string, listId: string): Promise<boolean> {
		const count = await this.#prismaClient.favouriteItem.count({
			where: {
				listId: listId,
				accommodationId: accommodationId,
			},
		});

		return count > 0;
	}

	public async addAccommodationToFavourite(listId: string, accommodationId: string): Promise<FavouriteItem> {
		const newItem = await this.#prismaClient.favouriteItem.create({
			data: {
				listId,
				accommodationId,
			},
		});

		return newItem;
	}

	public async getByListAndAccommodation(listId: string, accommodationId: string): Promise<FavouriteItem | null> {
		const item = await this.#prismaClient.favouriteItem.findFirst({
			where: {
				accommodationId: accommodationId,
				listId: listId,
			},
		});

		return item;
	}

	public async removeAccommodationFromFavourite(listId: string, accommodationId: string): Promise<boolean> {
		const result = await this.#prismaClient.favouriteItem.deleteMany({
			where: {
				listId: listId,
				accommodationId: accommodationId,
			},
		});

		return result.count > 0;
	}

	public async createList(name: string, ownerId: string): Promise<FavouriteList> {
		try {
			const result = await this.#prismaClient.favouriteList.create({
				data: {
					name: name,
					owner: {
						connect: { id: ownerId },
					},
				},
			});
			return result;
		} catch (error) {
			// P2002: Unique Constraint Violation
			if (error instanceof PrismaClientKnownRequestError && error.code === "P2002") {
				throw new BadRequestError("Duplicated name");
			}
			throw error;
		}
	}

	public async deleteFavouriteList(userId: string, listId: string): Promise<FavouriteList> {
		if (!(await this.isOwner(listId, userId))) {
			throw new NotFoundError("List not found or permission denied");
		}

		return await this.#prismaClient.favouriteList.delete({
			where: { id: listId },
		});
	}

	public async updateFavouriteList(userId: string, listId: string, name: string): Promise<FavouriteList> {
		if (!(await this.isOwner(listId, userId))) {
			throw new NotFoundError("List not found or permission denied");
		}

		try {
			const updatedList = await this.#prismaClient.favouriteList.update({
				where: { id: listId },
				data: { name },
			});
			return updatedList;
		} catch (error) {
			// P2002: Unique Constraint Violation
			if (error instanceof PrismaClientKnownRequestError && error.code === "P2002") {
				throw new BadRequestError("Duplicated name");
			}
			throw error;
		}
	}
}

export default FavouriteRepository;
