import { Request, type Response } from "express";
import UserService from "../services/user.service";
import FavouriteService from "../services/favourite.service";
import type { SaveUserRequest, UpdateUserRequest } from "../dto/request";

import type { ApiResponse } from "../dto/response";
import ResponseHelper from "../utils/response";
import { UserDto, UserWithFavouritesDto } from "@/dto/response/user.dto";
import DatabaseError from "@/errors/DatabaseError";

class UserController {
	readonly #userService: UserService;
	readonly #favouriteService: FavouriteService;

	constructor(userService: UserService, favouriteService: FavouriteService) {
		this.#userService = userService;
		this.#favouriteService = favouriteService;
	}

	// --- USER PROFILE ---
	public async getMe(req: Request, res: Response<ApiResponse<UserDto>>) {
		const userId = req.userId;

		// TODO: call image service to get user avatar
		const user = await this.#userService.getUser({ id: userId });

		return ResponseHelper.success(res, user as UserDto);
	}

	public async getUser(req: Request, res: Response<ApiResponse<UserDto | UserWithFavouritesDto>>) {
		try {
			const { id, withFavourites } = req.query;
			if (!id) return ResponseHelper.error(res, "Missing user ID parameter");

			const isWithFavs = withFavourites === "true";

			const user = await this.#userService.getUser({ id: id as string }, isWithFavs);

			return ResponseHelper.success(res, user!);
		} catch (error) {
			console.error("[UserController.getUser] Error:", error);
			const e = error as Error;
			return ResponseHelper.error(res, e.message, 500);
		}
	}

	public async createUser(req: SaveUserRequest, res: Response<ApiResponse<{ success: boolean }>>) {
		const { cognitoSub, email, name } = req.body;
		const OK = await this.#userService.createUser({ id: cognitoSub, email, name });

		if (!OK) {
			throw new DatabaseError("Failed to save user to database");
		}
		return ResponseHelper.success<{ success: boolean }>(res, { success: true });
	}

	public async updateUser(req: UpdateUserRequest, res: Response<ApiResponse<UserDto>>) {
		const userId = req.userId;

		if (!userId) {
			return ResponseHelper.error(res, "Unauthorized", 401);
		}

		const updatedUser = await this.#userService.updateUser(userId, req.body as any);
		return ResponseHelper.success<UserDto>(res, updatedUser);
	}

	// --- FAVOURITES ---
	public async createFavouriteList(req: Request, res: Response<ApiResponse<any>>) {
		try {
			const userId = req.userId;
			if (!userId) return ResponseHelper.error(res, "Unauthorized", 401); // Clean code guard

			const { name } = req.body;
			if (!name) return ResponseHelper.error(res, "Name is required");

			const newList = await this.#favouriteService.createList(name, userId);
			return ResponseHelper.success(res, {
				id: newList.getId(),
				name: newList.getName(),
				ownerId: newList.getOwnerId(),
				createdAt: newList.getCreatedAt(),
				updatedAt: newList.getUpdatedAt(),
				items: newList.getItems().map(i => ({
					id: i.getId(),
					listId: i.getListId(),
					accommodationId: i.getAccommodationId()
				}))
			}, 201);
		} catch (error) {
			const e = error as Error;
			return ResponseHelper.error(res, e.message, 400);
		}
	}

	public async updateFavouriteList(req: Request, res: Response<ApiResponse<any>>) {
		try {
			const userId = req.userId;
			if (!userId) return ResponseHelper.error(res, "Unauthorized", 401);

			const listId = req.params.id as string;
			const { name } = req.body;

			const updatedList = await this.#favouriteService.updateList(userId, listId, name);
			return ResponseHelper.success(res, {
				id: updatedList.getId(),
				name: updatedList.getName(),
				ownerId: updatedList.getOwnerId(),
				createdAt: updatedList.getCreatedAt(),
				updatedAt: updatedList.getUpdatedAt(),
				items: updatedList.getItems().map(i => ({
					id: i.getId(),
					listId: i.getListId(),
					accommodationId: i.getAccommodationId()
				}))
			});
		} catch (error) {
			const e = error as Error;
			return ResponseHelper.error(res, e.message, 400);
		}
	}

	public async deleteFavouriteList(req: Request, res: Response<ApiResponse<{ success: boolean }>>) {
		try {
			const userId = req.userId;
			if (!userId) return ResponseHelper.error(res, "Unauthorized", 401);

			const { listId } = req.query;
			await this.#favouriteService.deleteList(userId, listId as string);
			return ResponseHelper.success(res, { success: true });
		} catch (error) {
			const e = error as Error;
			return ResponseHelper.error(res, e.message, 400);
		}
	}

	public async addAccommodationToFavourite(req: Request, res: Response<ApiResponse<any>>) {
		try {
			const userId = req.userId;
			if (!userId) return ResponseHelper.error(res, "Unauthorized", 401);

			const { listId, accommodationId } = req.body;
			if (!listId || !accommodationId) return ResponseHelper.error(res, "Missing required fields");

			const addedItem = await this.#favouriteService.addAccommodation(userId, listId, accommodationId);
			return ResponseHelper.success(res, {
				id: addedItem.getId(),
				listId: addedItem.getListId(),
				accommodationId: addedItem.getAccommodationId()
			}, 201);
		} catch (error) {
			const e = error as Error;
			return ResponseHelper.error(res, e.message, 400);
		}
	}

	public async removeAccommodationFromFavourite(req: Request, res: Response<ApiResponse<{ success: boolean }>>) {
		try {
			const userId = req.userId;
			if (!userId) return ResponseHelper.error(res, "Unauthorized", 401);

			const { listId, accommodationId } = req.query;
			if (!listId || !accommodationId) return ResponseHelper.error(res, "Missing required fields");

			const result = await this.#favouriteService.removeAccommodation(userId, listId as string, accommodationId as string);
			return ResponseHelper.success(res, result);
		} catch (error) {
			const e = error as Error;
			return ResponseHelper.error(res, e.message, 400);
		}
	}
}

export default UserController;
