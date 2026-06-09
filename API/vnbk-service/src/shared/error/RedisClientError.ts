import { AppError } from "@/shared/error/AppError";

export class RedisClientError extends AppError {
	constructor(message = "Unknown problem with Redis client") {
		super(message, 500);
	}
}
