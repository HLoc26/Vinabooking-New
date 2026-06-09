import { AppError } from "@/shared/error/AppError";

export class ConflictError extends AppError {
	public readonly code?: string;

	constructor(message = "Conflict", code?: string) {
		super(message, 409);
		this.code = code;
	}
}
