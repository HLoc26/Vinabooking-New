import ResponseHelper from "../utils/ResponseHelper";

import { type Response } from "express";
import { type AddAccommodationToFavouriteResponse, RemoveAccommodationFromFavouriteResponse } from "../types/Response";
import type { AuthenticatedAddAccommodationRequest, AuthenticatedRemoveAccommodationRequest } from "../types/Request";
import type { ApiResponse } from "../types/Response";
import FavouriteRepository from "../repositories/FavouriteRepository";

class FavouriteController {
	private favouriteRepository = new FavouriteRepository();

	public async addAccommodationToFavouriteList(
		//
		req: AuthenticatedAddAccommodationRequest,
		res: Response<ApiResponse<AddAccommodationToFavouriteResponse>>
	) {
		const userId = req.user.id; // lấy userId từ req.user
		const { listId, accommodationId } = req.body;

		const updatedItem = await this.favouriteRepository.addAccommodationToFavouriteList(userId, listId, accommodationId);
		ResponseHelper.success<AddAccommodationToFavouriteResponse>(res, updatedItem);
	}

	public async removeAccommodationFromFavouriteList(
		//
		req: AuthenticatedRemoveAccommodationRequest,
		res: Response<ApiResponse<RemoveAccommodationFromFavouriteResponse>>
	) {
		const userId = req.user.id;
		const { accommodationId, listId } = req.params;

		await this.favouriteRepository.removeAccommodationFromFavouriteList(userId, listId, accommodationId);
		ResponseHelper.success<RemoveAccommodationFromFavouriteResponse>(res, { success: true });
	}
}

export default FavouriteController;
