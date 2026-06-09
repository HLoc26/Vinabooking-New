import { AppError } from "@/shared/error/AppError";

export class BadRequestError extends AppError {
	public readonly details?: string[];

	constructor(message = "Bad request", details?: string[]) {
		super(message, 400);
		this.details = details;
	}
}
