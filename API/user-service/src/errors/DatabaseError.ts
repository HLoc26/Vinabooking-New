import AppError from "./AppError";

class DatabaseError extends AppError {
	constructor(message = "Unknown problem with database") {
		super(message, 500);
	}
}

export default DatabaseError;
