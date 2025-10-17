import AppError from "./AppError.ts";

class EnvironmentNotSetError extends AppError {
    constructor(message = "Missing environment variable") {
        super(message, 500);
    }
}
export default EnvironmentNotSetError;
