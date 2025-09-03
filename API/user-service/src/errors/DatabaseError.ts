import AppError from "./AppError.ts";

class DatabaseError extends AppError {
    constructor(message = "Unknown problem with database") {
        super(message, 500);
    }
}

export default DatabaseError;
