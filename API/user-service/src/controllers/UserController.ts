import UserService from "../services/UserService";

import BadRequestError from "../errors/BadRequestError";
import NotFoundError from "../errors/NotFoundError";

import ResponseHelper from "../utils/ResponseHelper";

import { type Response } from "express";
import User from "../classes/User";
import { type SaveUserResponse, type CacheUserResponse, type UserResponse } from "../types/Response";
import type { CacheInfo, CacheUserRequest, FindUserRequest, FindUserByIdRequest, SaveUserDirectRequest, SaveUserRequest, AuthenticatedUpdateUserRequest } from "../types/Request";
import type { ApiResponse } from "../types/Response";
import RedisClientError from "../errors/RedisClientError";
import DatabaseError from "../errors/DatabaseError";
import FavouriteRepository from "../repositories/FavouriteRepository";

class UserController {
	private userService = new UserService();
	private favouriteRepository = new FavouriteRepository();

	public async getUser(req: FindUserRequest, res: Response<ApiResponse<UserResponse>>) {
		const { id, email } = req.query;
		const withFavourites = req.query.withFavourites === "true";
		if (!id && !email) {
			throw new BadRequestError("Specify at least an email an an id");
		}
		const user: User | null = await this.userService.getUser({ id, email }, withFavourites);
		if (!user) {
			throw new NotFoundError("User not found");
		}

		return ResponseHelper.success<UserResponse>(res, user.toJson());
	}

	public async getUserById(req: FindUserByIdRequest, res: Response<ApiResponse<UserResponse>>) {
		const id = req.params.id;
		const withFavourites = req.query.withFavourites === "true";

		if (!id) {
			throw new BadRequestError("Invalid ID");
		}

		const user: User | null = await this.userService.getUserById(id, withFavourites);

		if (!user) {
			throw new NotFoundError("User not found");
		}

		return ResponseHelper.success<UserResponse>(res, user.toJson());
	}

	public async saveUserDirect(req: SaveUserDirectRequest, res: Response<ApiResponse<boolean>>) {
		const { cognitoSub, email, name } = req.body;
		const OK = await this.userService.saveUser(cognitoSub, email, name);

		if (!OK) {
			throw new DatabaseError("Failed to save user to database");
		}
		return ResponseHelper.success<SaveUserResponse>(res, { success: true });
	}

	public async cacheUser(req: CacheUserRequest, res: Response<ApiResponse<CacheUserResponse>>) {
		const cacheInfo: CacheInfo = req.body;

		const OK = await this.userService.cacheUser(cacheInfo);

		if (!OK) {
			throw new RedisClientError("Failed to save user to cache");
		}
		return ResponseHelper.success<CacheUserResponse>(res, { success: true });
	}

	public async saveUserFromCache(req: SaveUserRequest, res: Response<ApiResponse<SaveUserResponse>>) {
		const email = req.body.email;

		const OK = await this.userService.saveUserFromCache(email);

		if (!OK) {
			throw new DatabaseError("Failed to save user to database");
		}
		return ResponseHelper.success<SaveUserResponse>(res, { success: true });
	}

	public async updateUser(req: AuthenticatedUpdateUserRequest, res: Response<ApiResponse<UserResponse>>) {
		const id = req.params.id;
		const data = req.body;

		const updatedUserSchema = await this.userService.updateUser(id, data);
		const updatedUser = User.fromSchema(updatedUserSchema);

		return ResponseHelper.success<UserResponse>(res, updatedUser.toJson());
	}
}

export default UserController;
