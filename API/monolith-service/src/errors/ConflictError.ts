import AppError from "./AppError";

class ConflictError extends AppError {
	public readonly code?: string;

	constructor(message = "Conflict", code?: string) {
		super(message, 409);
		this.code = code;
	}
}

export default ConflictError;
