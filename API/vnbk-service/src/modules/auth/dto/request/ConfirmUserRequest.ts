import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class ConfirmUserRequest {
	@IsString()
	@IsNotEmpty()
	id!: string;

	@IsEmail()
	email!: string;

	@IsString()
	@IsNotEmpty()
	confirmCode!: string;
}
