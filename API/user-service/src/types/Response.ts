import type User from "../classes/User";

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
