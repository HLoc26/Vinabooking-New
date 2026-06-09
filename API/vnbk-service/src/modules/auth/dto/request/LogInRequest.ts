import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class LogInRequest {
	@IsEmail()
	email!: string;

	@IsString()
	@IsNotEmpty()
	password!: string;
}
