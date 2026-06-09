import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class ConfirmForgotPasswordRequest {
	@IsEmail()
	email!: string;

	@IsString()
	@IsNotEmpty()
	code!: string;

	@IsString()
	@IsNotEmpty()
	newPassword!: string;
}
