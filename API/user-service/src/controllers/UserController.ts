import UserService from "../services/UserService";

import BadRequestError from "../errors/BadRequestError";
import NotFoundError from "../errors/NotFoundError";

import ResponseHelper from "../utils/ResponseHelper";

import { type Response } from "express";
import type User from "../classes/User";
import type { SaveUserResponse, CacheUserResponse, UserResponse } from "../types/Response";
import type { CacheInfo, CacheUserRequest, FindUserByIdRequest, SaveUserRequest } from "../types/Request";
import type { ApiResponse } from "../types/Response";
import RedisClientError from "../errors/RedisClientError";
import DatabaseError from "../errors/DatabaseError";

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

    public async saveUser(req: SaveUserRequest, res: Response<ApiResponse<SaveUserResponse>>) {
        const email = req.body.email;

        const OK = await this.userService.saveUser(email);

        if (!OK) {
            throw new DatabaseError("Failed to save user to database");
        }
        return ResponseHelper.success<SaveUserResponse>(res, { success: true });
    }
}

export default UserController;
