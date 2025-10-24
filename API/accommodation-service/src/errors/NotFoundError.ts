export class NotFoundError extends Error {
    public readonly statusCode: number;

    constructor(message: string) {
        super(message);
        this.name = "NotFoundError";
        this.statusCode = 404;

        // Giữ lại stack trace
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}