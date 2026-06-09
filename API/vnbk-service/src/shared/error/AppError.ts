/**
 * Base application error. Every domain/infrastructure error extends this so the
 * global ErrorHandlerMiddleware can translate it into an HTTP status + envelope.
 */
export class AppError extends Error {
	public readonly statusCode: number;

	constructor(message: string, statusCode: number) {
		super(message);
		this.name = new.target.name;
		this.statusCode = statusCode;
		// Restore the prototype chain (required when targeting ES5/ES2022 via tsc).
		Object.setPrototypeOf(this, new.target.prototype);
	}
}
