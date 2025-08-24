class AppError extends Error {
    public statusCode: number;

    constructor(message: string, statusCode: number) {
        super(message);
        this.statusCode = statusCode;

        // fix prototype chain when transpile with TS
        Object.setPrototypeOf(this, new.target.prototype);
    }
}

export default AppError;
