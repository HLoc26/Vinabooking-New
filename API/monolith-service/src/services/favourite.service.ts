import { FavouriteRepository } from "@/repositories";

class FavouriteService {
	readonly #favouriteRepository: FavouriteRepository;

	constructor(favouriteRepository: FavouriteRepository) {
		this.#favouriteRepository = favouriteRepository;
	}

	public async getListsByOwnerId(ownerId: string) {
		return await this.#favouriteRepository.getListsByOwnerId(ownerId);
	}

	public async createList(name: string, ownerId: string) {
		return await this.#favouriteRepository.createList(name, ownerId);
	}

	public async deleteList(userId: string, listId: string) {
		return await this.#favouriteRepository.deleteFavouriteList(userId, listId);
	}

	public async updateList(userId: string, listId: string, name: string) {
		return await this.#favouriteRepository.updateFavouriteList(userId, listId, name);
	}

	public async addAccommodation(listId: string, accommodationId: string) {
		return await this.#favouriteRepository.addAccommodationToFavourite(listId, accommodationId);
	}

	public async removeAccommodation(listId: string, accommodationId: string) {
		const isRemoved = await this.#favouriteRepository.removeAccommodationFromFavourite(listId, accommodationId);
		return { success: isRemoved };
	}
}

export default FavouriteService;
