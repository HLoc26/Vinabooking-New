import BadRequestError from "@/errors/BadRequestError";
import { PrismaClient } from "@/generated/client";
import { PrismaClientKnownRequestError } from "@/generated/internal/prismaNamespace";
import FavouriteMapper from "@/mappers/favourite.mapper";
import { FavouriteList as DomainFavouriteList, FavouriteItem as DomainFavouriteItem } from "@/models/favourite";

class FavouriteRepository {
	readonly #prismaClient: PrismaClient;
	constructor(prismaClient: PrismaClient) {
		this.#prismaClient = prismaClient;
	}

	public async getListsByOwnerId(ownerId: string): Promise<DomainFavouriteList[]> {
		const lists = await this.#prismaClient.favouriteList.findMany({
			where: { ownerId },
			include: { items: true },
		});
		return lists.map((list) => FavouriteMapper.toDomainList(list));
	}

	public async getListById(listId: string): Promise<DomainFavouriteList | null> {
		const list = await this.#prismaClient.favouriteList.findUnique({
			where: { id: listId },
			include: { items: true },
		});

		if (!list) return null;
		return FavouriteMapper.toDomainList(list);
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

	public async addAccommodationToFavourite(item: DomainFavouriteItem): Promise<DomainFavouriteItem> {
		const persistenceItem = FavouriteMapper.toPersistenceItem(item);
		const newItem = await this.#prismaClient.favouriteItem.create({
			data: {
				id: persistenceItem.id,
				listId: persistenceItem.listId,
				accommodationId: persistenceItem.accommodationId,
			},
		});

		return FavouriteMapper.toDomainItem(newItem);
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

	public async createList(list: DomainFavouriteList): Promise<DomainFavouriteList> {
		try {
			const persistenceList = FavouriteMapper.toPersistenceList(list);
			const result = await this.#prismaClient.favouriteList.create({
				data: {
					id: persistenceList.id,
					name: persistenceList.name,
					owner: {
						connect: { id: persistenceList.ownerId },
					},
					createdAt: persistenceList.createdAt,
					updatedAt: persistenceList.updatedAt,
				},
				include: { items: true },
			});
			return FavouriteMapper.toDomainList(result);
		} catch (error) {
			// P2002: Unique Constraint Violation
			if (error instanceof PrismaClientKnownRequestError && error.code === "P2002") {
				throw new BadRequestError("Duplicated name");
			}
			throw error;
		}
	}

	public async save(list: DomainFavouriteList): Promise<DomainFavouriteList> {
		try {
			const persistenceList = FavouriteMapper.toPersistenceList(list);
			const updatedList = await this.#prismaClient.favouriteList.update({
				where: { id: persistenceList.id },
				data: { 
					name: persistenceList.name,
					updatedAt: persistenceList.updatedAt
				},
				include: { items: true },
			});
			return FavouriteMapper.toDomainList(updatedList);
		} catch (error) {
			// P2002: Unique Constraint Violation
			if (error instanceof PrismaClientKnownRequestError && error.code === "P2002") {
				throw new BadRequestError("Duplicated name");
			}
			throw error;
		}
	}

	public async deleteFavouriteList(listId: string): Promise<void> {
		await this.#prismaClient.favouriteList.delete({
			where: { id: listId },
		});
	}
}

export default FavouriteRepository;
