import { injectable } from "tsyringe";
import { BaseRouter } from "@/http/BaseRouter";
import { UserController } from "@/modules/user/rest/UserController";
import { AuthGuard } from "@/http/middleware/AuthGuard";
import { ValidationPipe } from "@/http/middleware/ValidationPipe";
import { CreateUserRequest } from "@/modules/user/dto/request/CreateUserRequest";
import { UpdateUserRequest } from "@/modules/user/dto/request/UpdateUserRequest";

@injectable()
export class UserRouter extends BaseRouter {
	constructor(
		private readonly controller: UserController,
		private readonly auth: AuthGuard,
		private readonly validate: ValidationPipe
	) {
		super();
		this.registerRoutes();
	}

	public get basePath(): string {
		return "/user";
	}

	protected registerRoutes(): void {
		this.router.post("/", this.validate.body(CreateUserRequest), this.controller.createUser);
		this.router.patch("/", this.auth.handle, this.validate.body(UpdateUserRequest), this.controller.updateUser);
		this.router.get("/me", this.auth.handle, this.controller.getMe);
		this.router.get("/", this.auth.handle, this.controller.getUser);
	}
}
