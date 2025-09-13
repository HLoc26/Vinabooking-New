import AppError from "./AppError.ts";

class BufferError extends AppError {
    constructor(message = "Unknown problem with image buffer") {
        super(message, 500);
    }
}

export default BufferError;
