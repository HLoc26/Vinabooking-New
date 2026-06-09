import { IsIn, IsNotEmpty, IsString } from "class-validator";

/** Token-use values accepted by the verify endpoint (mirrors Cognito token_use). */
const TOKEN_TYPES = ["access", "id"] as const;

export class VerifyTokenRequest {
	@IsString()
	@IsNotEmpty()
	token!: string;

	@IsIn(TOKEN_TYPES)
	tokenType!: (typeof TOKEN_TYPES)[number];
}
