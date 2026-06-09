import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { ERole } from "@/modules/user";

export class SignUpRequest {
	@IsEmail()
	email!: string;

	@IsString()
	@IsNotEmpty()
	password!: string;

	@IsString()
	@IsNotEmpty()
	name!: string;

	@IsOptional()
	@IsString()
	phone?: string;

	@IsEnum(ERole)
	userType!: ERole;
}
