import BaseError from "./BaseError";

export default class NotFoundError extends BaseError {
    constructor(message = "Not Found") {
        super(message, 404);
    }
}
