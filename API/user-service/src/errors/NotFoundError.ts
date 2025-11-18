import AppError from "./AppError";

class NotFoundError extends AppError {
	constructor(message = "The requested resource was not found") {
		super(message, 404);
	}
}

export default NotFoundError;
