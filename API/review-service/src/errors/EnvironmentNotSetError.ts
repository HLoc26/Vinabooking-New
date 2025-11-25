import BaseError from "./BaseError";

class EnvironmentNotSetError extends BaseError {
	constructor(message = "Missing environment variable") {
		super(message, 500);
	}
}
export default EnvironmentNotSetError;
