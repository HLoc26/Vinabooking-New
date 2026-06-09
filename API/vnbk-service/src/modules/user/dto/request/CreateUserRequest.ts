import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { ERole } from "@/modules/user/enums/ERole";

export class CreateUserRequest {
	@IsString()
	@IsNotEmpty()
	cognitoSub!: string;

	@IsEmail()
	email!: string;

	@IsString()
	@IsNotEmpty()
	name!: string;

	@IsOptional()
	@IsString()
	phone?: string;

	@IsOptional()
	@IsEnum(ERole)
	role?: ERole;
}
