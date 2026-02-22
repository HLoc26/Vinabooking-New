import { Request, type Response } from "express";
import UserService from "../services/user.service";
import FavouriteService from "../services/favourite.service";
import type { SaveUserRequest, UpdateUserRequest } from "../types/requests";

import type { ApiResponse } from "../types/responses";
import ResponseHelper from "../utils/response";
import { User, FavouriteList, FavouriteItem } from "@/generated/client";
import DatabaseError from "@/errors/DatabaseError";
import { UserWithFavourites } from "@/types/dtos/get-user.dto";

class UserController {
	readonly #userService: UserService;
	readonly #favouriteService: FavouriteService;

	constructor(userService: UserService, favouriteService: FavouriteService) {
		this.#userService = userService;
		this.#favouriteService = favouriteService;
	}

	// --- USER PROFILE ---
	public async getMe(req: Request, res: Response<ApiResponse<User>>) {
		const userId = req.userId;

		// TODO: call image service to get user avatar
		const user = await this.#userService.getUser({ id: userId });

		return ResponseHelper.success(res, user);
	}

	public async getUser(req: Request, res: Response<ApiResponse<User | UserWithFavourites>>) {
		const { id, withFavourites } = req.query;
		if (!id) return ResponseHelper.error(res, "Missing user ID parameter");

		const isWithFavs = withFavourites === "true";
		const user = await this.#userService.getUser({ id: id as string }, isWithFavs);
		return ResponseHelper.success(res, user);
	}

	public async createUser(req: SaveUserRequest, res: Response<ApiResponse<{ success: boolean }>>) {
		const { cognitoSub, email, name } = req.body;
		const OK = await this.#userService.createUser({ id: cognitoSub, email, name });

		if (!OK) {
			throw new DatabaseError("Failed to save user to database");
		}
		return ResponseHelper.success<{ success: boolean }>(res, { success: true });
	}

	public async updateUser(req: UpdateUserRequest, res: Response<ApiResponse<User>>) {
		const userId = req.userId;

		if (!userId) {
			return ResponseHelper.error(res, "Unauthorized", 401);
		}

		const data = req.body;

		const updatedUser = await this.#userService.updateUser(userId, data);

		return ResponseHelper.success<User>(res, updatedUser);
	}

	// --- FAVOURITES ---
	public async createFavouriteList(req: Request, res: Response<ApiResponse<FavouriteList>>) {
		const userId = req.userId!;
		const { name } = req.body;
		if (!name) return ResponseHelper.error(res, "Name is required");

		const newList = await this.#favouriteService.createList(name, userId);
		return ResponseHelper.success(res, newList, 201);
	}

	public async updateFavouriteList(req: Request, res: Response<ApiResponse<FavouriteList>>) {
		const userId = req.userId!;
		const listId = req.params.id as string;
		const { name } = req.body;

		const updatedList = await this.#favouriteService.updateList(userId, listId, name);
		return ResponseHelper.success(res, updatedList);
	}

	public async deleteFavouriteList(req: Request, res: Response<ApiResponse<{ success: boolean }>>) {
		const userId = req.userId!;
		const { listId } = req.query;

		await this.#favouriteService.deleteList(userId, listId as string);
		return ResponseHelper.success(res, { success: true });
	}

	public async addAccommodationToFavourite(req: Request, res: Response<ApiResponse<FavouriteItem>>) {
		const { listId, accommodationId } = req.body;
		if (!listId || !accommodationId) return ResponseHelper.error(res, "Missing required fields");

		const addedItem = await this.#favouriteService.addAccommodation(listId, accommodationId);
		return ResponseHelper.success(res, addedItem, 201);
	}

	public async removeAccommodationFromFavourite(req: Request, res: Response<ApiResponse<{ success: boolean }>>) {
		const { listId, accommodationId } = req.query;
		if (!listId || !accommodationId) return ResponseHelper.error(res, "Missing required fields");

		const result = await this.#favouriteService.removeAccommodation(listId as string, accommodationId as string);
		return ResponseHelper.success(res, result);
	}
}

export default UserController;
