import { AppError } from "@/shared/error/AppError";

export class DatabaseError extends AppError {
	constructor(message = "Unknown problem with database") {
		super(message, 500);
	}
}
