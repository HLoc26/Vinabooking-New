import { inject, injectable } from "tsyringe";
import type { Request } from "express";
import { BaseController } from "@/http/BaseController";
import { USER_SERVICE } from "@/modules/user/user.tokens";
import type { IUserService } from "@/modules/user/service/IUserService";
import { UserDtoMapper } from "@/modules/user/rest/mapper/UserDtoMapper";
import type { CreateUserRequest } from "@/modules/user/dto/request/CreateUserRequest";
import type { UpdateUserRequest } from "@/modules/user/dto/request/UpdateUserRequest";
import type { UserResponse } from "@/modules/user/dto/response/UserResponse";
import { BadRequestError } from "@/shared/error/BadRequestError";

@injectable()
export class UserController extends BaseController {
	constructor(
		@inject(USER_SERVICE) private readonly userService: IUserService,
		private readonly mapper: UserDtoMapper
	) {
		super();
	}

	public createUser = this.handle<UserResponse>(async (req: Request) => {
		const dto = req.validatedBody as CreateUserRequest;
		const user = await this.userService.create(dto);
		return this.created(this.mapper.toResponse(user));
	});

	public updateUser = this.handle<UserResponse>(async (req: Request) => {
		const userId = this.requireUserId(req);
		const dto = req.validatedBody as UpdateUserRequest;
		const user = await this.userService.update(userId, dto);
		return this.ok(this.mapper.toResponse(user));
	});

	public getMe = this.handle<UserResponse>(async (req: Request) => {
		const userId = this.requireUserId(req);
		const user = await this.userService.getById(userId);
		return this.ok(this.mapper.toResponse(user));
	});

	public getUser = this.handle<UserResponse>(async (req: Request) => {
		const id = req.query.id;
		if (!id || typeof id !== "string") {
			throw new BadRequestError("Missing user ID parameter");
		}
		const user = await this.userService.getById(id);
		return this.ok(this.mapper.toResponse(user));
	});
}
