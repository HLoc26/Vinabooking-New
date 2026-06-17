import BadRequestError from "@/errors/BadRequestError";

export class FavouriteItem {
	readonly #id: string;
	readonly #listId: string;
	readonly #accommodationId: string;

	public constructor(
		id: string,
		listId: string,
		accommodationId: string
	) {
		this.#id = id;
		this.#listId = listId;
		this.#accommodationId = accommodationId;

		this.validate();
	}

	private validate(): void {
		if (!this.#id) {
			throw new BadRequestError("FavouriteItem id is required");
		}
		if (!this.#listId) {
			throw new BadRequestError("FavouriteItem listId is required");
		}
		if (!this.#accommodationId) {
			throw new BadRequestError("FavouriteItem accommodationId is required");
		}
	}

	public getId(): string { return this.#id; }
	public getListId(): string { return this.#listId; }
	public getAccommodationId(): string { return this.#accommodationId; }

	public static builder(): FavouriteItemBuilder {
		return new FavouriteItemBuilder();
	}
}

export class FavouriteItemBuilder {
	#id?: string;
	#listId?: string;
	#accommodationId?: string;

	public setId(id: string): this { this.#id = id; return this; }
	public setListId(listId: string): this { this.#listId = listId; return this; }
	public setAccommodationId(accommodationId: string): this { this.#accommodationId = accommodationId; return this; }

	public build(): FavouriteItem {
		if (!this.#id || !this.#listId || !this.#accommodationId) {
			throw new Error("Missing required fields in FavouriteItemBuilder");
		}
		return new FavouriteItem(
			this.#id,
			this.#listId,
			this.#accommodationId
		);
	}
}
