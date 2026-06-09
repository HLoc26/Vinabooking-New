import { AppError } from "@/shared/error/AppError";

export class IdentityProviderError extends AppError {
	constructor(message = "Unknown error with identity provider") {
		super(message, 500);
	}
}
