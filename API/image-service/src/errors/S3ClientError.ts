import AppError from "./AppError";

class S3ClientError extends AppError {
	constructor(message = "Error with S3 Client") {
		super(message, 500);
	}
}

export default S3ClientError;
