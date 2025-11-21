import { FavouriteList } from "../../generated/prisma";
import type User from "../classes/User";
import { FavouriteListWithItems } from "./Favourite";

export interface ApiResponse<T> {
	success: boolean;
	data: T | null;
	error: string | null;
}

export type UserResponse = ReturnType<User["toJson"]>;

export interface CacheUserResponse {
	success: boolean;
}

export interface SaveUserResponse {
	success: boolean;
}

export interface AddAccommodationToFavouriteResponse {
	id: string;
	listId: string;
	accommodationId: string;
}

export interface RemoveAccommodationFromFavouriteResponse {
	success: boolean;
}

export type CreateFavouriteListResponse = FavouriteListWithItems;
