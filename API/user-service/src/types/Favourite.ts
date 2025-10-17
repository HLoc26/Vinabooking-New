import { type FavouriteList as FavouriteListSchema, type FavouriteItem as FavouriteItemSchema } from "../../generated/prisma/index.js";

export interface IFavouriteList {
    id: string;
    items: Array<IFavouriteItem>;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface IFavouriteItem {
    id: string;
    accommodationId: string;
}

export type FavouriteListWithItems = { items: FavouriteItemSchema[] } & FavouriteListSchema;
