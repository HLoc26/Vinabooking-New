import AppError from "./AppError";

class IdentityProviderError extends AppError {
    constructor(message = "Unknown error with identity provider") {
        super(message, 500);
    }
}
export default IdentityProviderError;
