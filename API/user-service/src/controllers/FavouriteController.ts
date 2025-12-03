import ResponseHelper from "../utils/ResponseHelper";

import { type Response } from "express";
import { type AddAccommodationToFavouriteResponse, RemoveAccommodationFromFavouriteResponse } from "../types/Response";
import type {
	AuthenticatedAddAccommodationRequest,
	AuthenticatedCreateFavouriteListRequest,
	AuthenticatedDeleteFavouriteListRequest,
	AuthenticatedRemoveAccommodationRequest,
	AuthenticatedUpdateFavouriteListRequest,
} from "../types/Request";
import type { ApiResponse, CreateFavouriteListResponse, DeleteFavouriteListResponse, UpdateFavouriteListResponse } from "../types/Response";
import FavouriteRepository from "../repositories/FavouriteRepository";
import BadRequestError from "../errors/BadRequestError";

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
		console.log("Logged In: ", userId);
		const { accommodationId, listId } = req.query;

		if (!accommodationId || !listId) {
			throw new BadRequestError("Missing accommodationId or listId");
		}

		await this.favouriteRepository.removeAccommodationFromFavouriteList(userId, listId, accommodationId);
		ResponseHelper.success<RemoveAccommodationFromFavouriteResponse>(res, { success: true });
	}

	public async createFavouriteList(req: AuthenticatedCreateFavouriteListRequest, res: Response<ApiResponse<CreateFavouriteListResponse>>) {
		const userId = req.user.id;
		const { name } = req.body;

		const list = await this.favouriteRepository.create(userId, name);
		ResponseHelper.success<CreateFavouriteListResponse>(res, { ...list, items: [] });
	}

	public async deleteFavouriteList(req: AuthenticatedDeleteFavouriteListRequest, res: Response<ApiResponse<DeleteFavouriteListResponse>>) {
		const userId = req.user.id;
		const { listId } = req.query;
		await this.favouriteRepository.deleteFavouriteList(userId, listId);

		ResponseHelper.success(res, { success: true });
	}

	public async updateFavouriteList(req: AuthenticatedUpdateFavouriteListRequest, res: Response<ApiResponse<UpdateFavouriteListResponse>>) {
		const userId = req.user.id;
		const { listId } = req.params;
		const { name } = req.body;

		const updatedList = await this.favouriteRepository.updateFavouriteList(userId, listId, name);
		ResponseHelper.success<UpdateFavouriteListResponse>(res, updatedList);
	}
}

export default FavouriteController;
