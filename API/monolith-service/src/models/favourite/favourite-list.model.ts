import BadRequestError from "@/errors/BadRequestError";
import { FavouriteItem } from "./favourite-item.model";

export class FavouriteList {
	readonly #id: string;
	#name: string;
	readonly #ownerId: string;
	readonly #createdAt: Date;
	#updatedAt: Date;
	#items: FavouriteItem[];

	public constructor(
		id: string,
		name: string,
		ownerId: string,
		createdAt: Date,
		updatedAt: Date,
		items: FavouriteItem[]
	) {
		this.#id = id;
		this.#name = name;
		this.#ownerId = ownerId;
		this.#createdAt = createdAt;
		this.#updatedAt = updatedAt;
		this.#items = items;

		this.validate();
	}

	private validate(): void {
		if (!this.#id) {
			throw new BadRequestError("FavouriteList id is required");
		}
		if (!this.#name || this.#name.trim() === "") {
			throw new BadRequestError("FavouriteList name is required");
		}
		if (!this.#ownerId) {
			throw new BadRequestError("FavouriteList ownerId is required");
		}
	}

	public getId(): string { return this.#id; }
	public getName(): string { return this.#name; }
	public getOwnerId(): string { return this.#ownerId; }
	public getCreatedAt(): Date { return this.#createdAt; }
	public getUpdatedAt(): Date { return this.#updatedAt; }
	public getItems(): FavouriteItem[] { return [...this.#items]; }

	public setName(name: string): void {
		if (!name || name.trim() === "") {
			throw new BadRequestError("Name cannot be empty");
		}
		this.#name = name;
		this.#updatedAt = new Date();
	}

	public isOwner(userId: string): boolean {
		return this.#ownerId === userId;
	}

	public hasAccommodation(accommodationId: string): boolean {
		return this.#items.some((item) => item.getAccommodationId() === accommodationId);
	}

	public addAccommodation(item: FavouriteItem): void {
		if (item.getListId() !== this.#id) {
			throw new BadRequestError("Item belongs to another list");
		}
		if (this.hasAccommodation(item.getAccommodationId())) {
			throw new BadRequestError("Accommodation already exists in this favourite list");
		}
		this.#items.push(item);
		this.#updatedAt = new Date();
	}

	public removeAccommodation(accommodationId: string): boolean {
		const initialLength = this.#items.length;
		this.#items = this.#items.filter((item) => item.getAccommodationId() !== accommodationId);
		if (this.#items.length !== initialLength) {
			this.#updatedAt = new Date();
			return true;
		}
		return false;
	}

	public static builder(): FavouriteListBuilder {
		return new FavouriteListBuilder();
	}
}

export class FavouriteListBuilder {
	#id?: string;
	#name?: string;
	#ownerId?: string;
	#createdAt?: Date;
	#updatedAt?: Date;
	#items: FavouriteItem[] = [];

	public setId(id: string): this { this.#id = id; return this; }
	public setName(name: string): this { this.#name = name; return this; }
	public setOwnerId(ownerId: string): this { this.#ownerId = ownerId; return this; }
	public setCreatedAt(createdAt: Date): this { this.#createdAt = createdAt; return this; }
	public setUpdatedAt(updatedAt: Date): this { this.#updatedAt = updatedAt; return this; }
	public setItems(items: FavouriteItem[]): this { this.#items = items; return this; }

	public build(): FavouriteList {
		if (!this.#id || !this.#name || !this.#ownerId) {
			throw new Error("Missing required fields in FavouriteListBuilder");
		}

		const now = new Date();
		return new FavouriteList(
			this.#id,
			this.#name,
			this.#ownerId,
			this.#createdAt || now,
			this.#updatedAt || now,
			this.#items
		);
	}
}
