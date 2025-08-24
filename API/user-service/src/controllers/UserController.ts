import UserService from "../services/UserService.ts";

import BadRequestError from "../errors/BadRequestError.ts";
import NotFoundError from "../errors/NotFoundError.ts";

import ResponseHelper from "../utils/ResponseHelper.ts";

import type { User } from "../../generated/prisma/index.js";
import { type Request, type Response } from "express";

class UserController {
    private userService = new UserService();

    public async getUserById(req: Request<{ id: string }>, res: Response) {
        const id = req.params.id;

        if (!id) {
            throw new BadRequestError("Invalid ID");
        }

        const user: User | null = await this.userService.getUserById(id);

        if (!user) {
            throw new NotFoundError("User not found");
        }

        return ResponseHelper.success(res, user);
    }
}

export default UserController;
