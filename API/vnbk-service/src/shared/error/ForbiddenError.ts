import { AppError } from "@/shared/error/AppError";

export class ForbiddenError extends AppError {
	constructor(message = "Forbidden") {
		super(message, 403);
	}
}
