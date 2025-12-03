import { type User as UserSchema } from "../../generated/prisma/client";

import { type FavouriteListWithItems, type IFavouriteList } from "./Favourite";
import type { CacheInfo } from "./Request";

export type UserWithFavourites = { favourites: FavouriteListWithItems[] } & UserSchema;

// export enum EUserRole {
//     traveler = "Traveler",
//     accomm_owner = "AccommodationOwner",
// }

// Mimics enum
export const EUserRole = {
	TRAVELLER: "Traveller",
	ACCOMMODATION_OWNER: "AccommodationOwner",
} as const;

export type EUserRole = (typeof EUserRole)[keyof typeof EUserRole];

export interface IUser {
	id: string;
	name: string;
	phone: string | null;
	email: string;
	role: string;

	favouriteLists: Array<IFavouriteList>;

	createdAt?: Date;
	updatedAt?: Date;
}

export type SaveUserInfo = {
	email: string;
} & CacheInfo["info"]; // Lấy type từ CacheInfo["info"]
