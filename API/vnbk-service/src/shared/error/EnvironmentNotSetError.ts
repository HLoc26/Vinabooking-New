import { AppError } from "@/shared/error/AppError";

export class EnvironmentNotSetError extends AppError {
	constructor(message = "Missing environment variable") {
		super(message, 500);
	}
}
