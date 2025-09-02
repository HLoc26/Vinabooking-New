import { type User as UserSchema } from "../../generated/prisma/index.js";

import { type FavouriteListWithItems, type IFavouriteList } from "./Favourite.ts";

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
    phone: string;
    role: string;

    favouriteLists: Array<IFavouriteList>;

    createdAt?: Date;
    updatedAt?: Date;
}
