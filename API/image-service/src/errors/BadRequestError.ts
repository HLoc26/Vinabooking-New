import AppError from "./AppError.ts";

class BadRequestError extends AppError {
    constructor(message = "Bad request") {
        super(message, 400);
    }
}

export default BadRequestError;
