import apiClient from "../services/apiClient";
import { type AddAccommodationToFavouriteResponse, type ApiResponse } from "../types/Response";
import type { FavouriteList } from "../types/FavouriteList";

const favouriteApi = {
	getUserFavourite: (
		userId: string //
	) =>
		apiClient
			.get<ApiResponse<{ favourites: FavouriteList[] }>>("/users", {
				params: {
					id: userId,
					withFavourites: true,
				},
			})
			.then((r) => r.data.data),
	addAccommodation: (favouriteId: string, accommodationId: string) =>
		apiClient
			.post<ApiResponse<AddAccommodationToFavouriteResponse>>("/users/favourites/accommodation", {
				listId: favouriteId,
				accommodationId,
			})
			.then((r) => r.data.data),
	removeAccommodation: (favouriteId: string, accommodationId: string) =>
		apiClient
			.delete<ApiResponse<{ success: boolean }>>("/users/favourites/accommodation", {
				params: {
					listId: favouriteId,
					accommodationId,
				},
			})
			.then((r) => r.data.data),
	createFavouriteList: (name: string) =>
		apiClient
			.post<ApiResponse<FavouriteList>>("/users/favourites", {
				name,
			})
			.then((r) => r.data.data),
	deleteFavouriteList: (id: string) =>
		apiClient
			.delete<ApiResponse<{ success: boolean }>>("/users/favourites", {
				params: { listId: id },
			})
			.then((r) => r.data.data),
	updateFavouriteList: (id: string, name: string) =>
		apiClient
			.patch<ApiResponse<FavouriteList>>(`/users/favourites/${id}`, {
				name,
			})
			.then((r) => r.data.data),
};

export default favouriteApi;
