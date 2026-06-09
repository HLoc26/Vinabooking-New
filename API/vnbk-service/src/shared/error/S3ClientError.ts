import { AppError } from "@/shared/error/AppError";

export class S3ClientError extends AppError {
	constructor(message = "Error with S3 client") {
		super(message, 500);
	}
}
