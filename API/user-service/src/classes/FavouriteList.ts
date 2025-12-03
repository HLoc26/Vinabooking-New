import FavouriteItem from "./FavouriteItem";

import { type IFavouriteList, type FavouriteListWithItems } from "../types/Favourite";

class FavouriteList {
	#id: string;
	#items: Array<FavouriteItem>;
	#name: string;
	#createdAt: Date;
	#updatedAt: Date;

	constructor(props: IFavouriteList) {
		this.#id = props.id;
		this.#items = props.items?.map((item) => new FavouriteItem(item));
		this.#name = props.name;
		this.#createdAt = props.createdAt ?? new Date();
		this.#updatedAt = props.updatedAt ?? new Date();
	}

	public static fromSchema(schema: FavouriteListWithItems): FavouriteList {
		return new FavouriteList({
			id: schema.id,
			items: schema.items,
			name: schema.name,
			createdAt: schema.createdAt,
			updatedAt: schema.updatedAt,
		});
	}

	public toJson() {
		return {
			id: this.id,
			items: this.items.map((item) => item.toJson()),
			name: this.name,
			createdAt: this.createdAt,
			updatedAt: this.updatedAt,
		};
	}

	get id() {
		return this.#id;
	}
	get items() {
		return this.#items;
	}
	get name() {
		return this.#name;
	}
	get createdAt() {
		return this.#createdAt;
	}
	get updatedAt() {
		return this.#updatedAt;
	}
	set items(newItems: Array<FavouriteItem>) {
		this.#items = Array.from(newItems);
		this.#updatedAt = new Date();
	}
}

export default FavouriteList;
