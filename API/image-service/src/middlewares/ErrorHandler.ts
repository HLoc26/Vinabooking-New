import { type NextFunction, type Request, type Response } from "express";
import ResponseHelper from "../utils/ResponseHelper.ts";
import type AppError from "../errors/AppError.ts";

class ErrorHandler {
    public static handle(err: AppError, _req: Request, res: Response, _next: NextFunction) {
        console.error(err);
        const statusCode = err.statusCode || 500;
        const message = err.message;

        return ResponseHelper.error(res, message, statusCode);
        _next();
    }
}

export default ErrorHandler;
