import { Request, type Response } from "express";
import UserService from "../services/user.service";
import type { SaveUserRequest, UpdateUserRequest } from "../types/requests";

import type { ApiResponse } from "../types/responses";
import ResponseHelper from "../utils/response";
import { User } from "@/generated/client";

class UserController {
	readonly #userService: UserService;

	constructor(userService: UserService) {
		this.#userService = userService;
	}

	public async getMe(req: Request, res: Response<ApiResponse<User>>) {
		const userId = req.userId;

		// TODO: call image service to get user avatar
		const user = await this.#userService.getUser({ id: userId });

		return ResponseHelper.success(res, user);
	}

	public async createUser(req: SaveUserRequest, res: Response<ApiResponse<{ success: boolean }>>) {
		const { cognitoSub, email, name } = req.body;
		const OK = await this.#userService.createUser({ id: cognitoSub, email, name });

		if (!OK) {
			throw new Error("Failed to save user to database");
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
}

export default UserController;
