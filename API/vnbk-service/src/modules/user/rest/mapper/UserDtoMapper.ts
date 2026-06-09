import { injectable } from "tsyringe";
import type { User } from "@/modules/user/domain/User";
import { UserResponse } from "@/modules/user/dto/response/UserResponse";

/** Maps the User domain model to its response DTO. */
@injectable()
export class UserDtoMapper {
	public toResponse(user: User): UserResponse {
		const response = new UserResponse();
		response.id = user.id;
		response.email = user.email;
		response.name = user.name;
		response.phone = user.phone;
		response.role = user.role;
		return response;
	}
}
