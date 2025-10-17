import AppError from "./AppError";

class RedisClientError extends AppError {
    constructor(message = "Unknown problem with Redis client") {
        super(message, 500);
    }
}

export default RedisClientError;
