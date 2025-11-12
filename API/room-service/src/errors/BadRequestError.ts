export class BadRequestError extends Error {
	public readonly statusCode: number;

	constructor(message: string) {
		super(message);
		this.name = "BadRequestError";
		this.statusCode = 400;

		// Giữ lại stack trace (quan trọng cho V8)
		if (Error.captureStackTrace) {
			Error.captureStackTrace(this, this.constructor);
		}
	}
}
