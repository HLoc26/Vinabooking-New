import BaseError from "./AppError";

export default class ForbiddenError extends BaseError {
	constructor(message = "Forbidden") {
		super(message, 403);
	}
}
