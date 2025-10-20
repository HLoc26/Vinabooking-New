import BaseError from "./BaseError";

export default class BadRequestError extends BaseError {
    constructor(message = "Bad Request") {
        super(message, 400);
    }
}
