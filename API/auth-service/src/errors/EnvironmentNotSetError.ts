import AppError from "./AppError";

class EnvironmentNotSetError extends AppError {
    constructor(message = "Missing environment variable") {
        super(message, 500);
    }
}
export default EnvironmentNotSetError;
