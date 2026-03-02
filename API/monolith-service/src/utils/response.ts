import AppError from "@/errors/AppError";
import type { NextFunction, Request, Response } from "express";

class ResponseHelper {
	public static success<T>(res: Response, data: T, statusCode: number = 200) {
		return res.status(statusCode).json({
			success: true,
			data: data,
			error: null,
		});
	}

	public static error(res: Response, message: string, statusCode: number = 200) {
		return res.status(statusCode).json({
			success: false,
			data: null,
			error: message,
		});
	}
}

export class ErrorHandler {
	public static handle(err: AppError, _req: Request, res: Response, _next: NextFunction) {
		console.error(err);
		const statusCode = err.statusCode || 500;
		const message = err.message;

		return ResponseHelper.error(res, message, statusCode);
	}
}

export default ResponseHelper;
