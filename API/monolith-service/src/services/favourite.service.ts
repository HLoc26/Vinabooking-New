import { NotFoundError } from "@/errors";
import { FavouriteItem, FavouriteList } from "@/models/favourite";
import { FavouriteRepository } from "@/repositories";
import { v4 as uuidv4 } from "uuid";
import AccommodationService from "./accommodation.service";

// Note: we can use FavouriteList.builder() instead of importing the builders directly if we want


class FavouriteService {
	readonly #favouriteRepository: FavouriteRepository;
	readonly #accommodationService: AccommodationService;

	constructor(favouriteRepository: FavouriteRepository, accommodationService: AccommodationService) {
		this.#favouriteRepository = favouriteRepository;
		this.#accommodationService = accommodationService;
	}

	public async getListsByOwnerId(ownerId: string) {
		return await this.#favouriteRepository.getListsByOwnerId(ownerId);
	}

	public async getListById(listId: string) {
		return await this.#favouriteRepository.getListById(listId);
	}

	public async createList(name: string, ownerId: string) {
		const newList = FavouriteList.builder()
			.setId(uuidv4())
			.setName(name)
			.setOwnerId(ownerId)
			.build();

		return await this.#favouriteRepository.createList(newList);
	}

	public async deleteList(userId: string, listId: string) {
		const list = await this.#favouriteRepository.getListById(listId);
		if (!list || !list.isOwner(userId)) {
			throw new NotFoundError("List not found or permission denied");
		}

		await this.#favouriteRepository.deleteFavouriteList(listId);
		return list;
	}

	public async updateList(userId: string, listId: string, name: string) {
		const list = await this.#favouriteRepository.getListById(listId);
		if (!list || !list.isOwner(userId)) {
			throw new NotFoundError("List not found or permission denied");
		}

		list.setName(name);
		return await this.#favouriteRepository.save(list);
	}

	public async addAccommodation(userId: string, listId: string, accommodationId: string) {
		const list = await this.#favouriteRepository.getListById(listId);
		if (!list || !list.isOwner(userId)) {
			throw new NotFoundError("List not found or permission denied");
		}

		// Cross-domain check: Ensure accommodation exists
		const accommodation = await this.#accommodationService.getAccommodationById(accommodationId);
		if (!accommodation) {
			throw new NotFoundError(`Accommodation ${accommodationId} not found`);
		}

		const newItem = FavouriteItem.builder()
			.setId(uuidv4())
			.setListId(listId)
			.setAccommodationId(accommodationId)
			.build();

		// Delegate business rule to Domain Model (checks duplicates)
		list.addAccommodation(newItem);

		// Persist the new item
		await this.#favouriteRepository.addAccommodationToFavourite(newItem);

		// Update the list timestamp if necessary
		await this.#favouriteRepository.save(list);

		return newItem;
	}

	public async removeAccommodation(userId: string, listId: string, accommodationId: string) {
		const list = await this.#favouriteRepository.getListById(listId);
		if (!list || !list.isOwner(userId)) {
			throw new NotFoundError("List not found or permission denied");
		}

		// Delegate logic to Domain Model
		const isRemoved = list.removeAccommodation(accommodationId);
		if (isRemoved) {
			await this.#favouriteRepository.removeAccommodationFromFavourite(listId, accommodationId);
			// Save updated timestamp
			await this.#favouriteRepository.save(list);
		}

		return { success: isRemoved };
	}
}

export default FavouriteService;
