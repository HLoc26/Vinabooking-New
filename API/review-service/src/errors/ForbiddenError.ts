import BaseError from "./BaseError";

export default class ForbiddenError extends BaseError {
	constructor(message = "Forbidden") {
		super(message, 403);
	}
}
