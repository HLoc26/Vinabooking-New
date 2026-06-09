import { IsEmail } from "class-validator";

export class GetOtpQuery {
	@IsEmail()
	email!: string;
}
