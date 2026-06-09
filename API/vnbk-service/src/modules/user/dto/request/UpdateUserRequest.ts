import { IsOptional, IsString } from "class-validator";

export class UpdateUserRequest {
	@IsOptional()
	@IsString()
	name?: string;

	@IsOptional()
	@IsString()
	phone?: string;
}
