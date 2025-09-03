import UserService from "../services/UserService.ts";

import BadRequestError from "../errors/BadRequestError.ts";
import NotFoundError from "../errors/NotFoundError.ts";

import ResponseHelper from "../utils/ResponseHelper.ts";

import { type Response } from "express";
import type User from "../classes/User.ts";
import type { CacheUserResponse, UserResponse } from "../types/Response.ts";
import type { CacheInfo, CacheUserRequest, FindUserByIdRequest } from "../types/Request.ts";
import type { ApiResponse } from "../types/Response.ts";
import RedisClientError from "../errors/RedisClientError.ts";

class UserController {
    private userService = new UserService();

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

    public async cacheUser(req: CacheUserRequest, res: Response<ApiResponse<CacheUserResponse>>) {
        const cacheInfo: CacheInfo = req.body;

        const OK = await this.userService.cacheUser(cacheInfo);

        if (!OK) {
            throw new RedisClientError("Failed to save user to cache");
        }
        return ResponseHelper.success<CacheUserResponse>(res, { success: true });
    }
}

export default UserController;
