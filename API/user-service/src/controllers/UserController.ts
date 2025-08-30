import UserService from "../services/UserService.ts";

import BadRequestError from "../errors/BadRequestError.ts";
import NotFoundError from "../errors/NotFoundError.ts";

import ResponseHelper from "../utils/ResponseHelper.ts";

import { type Response } from "express";
import type User from "../classes/User.ts";
import type { UserResponse } from "../types/Response.ts";
import type { FindUserByIdRequest } from "../types/Request.ts";
import type { ApiResponse } from "../types/Response.ts";

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

        return ResponseHelper.success(res, user.toJson());
    }
}

export default UserController;
