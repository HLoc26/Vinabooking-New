import { type FavouriteList as FavouriteListSchema, type FavouriteItem as FavouriteItemSchema } from "../../generated/prisma/client";

export interface IFavouriteList {
	id: string;
	items: Array<IFavouriteItem>;
	name: string;
	createdAt?: Date;
	updatedAt?: Date;
}

export interface IFavouriteItem {
	id: string;
	accommodationId: string;
}

export type FavouriteListWithItems = { items: FavouriteItemSchema[] } & FavouriteListSchema;
