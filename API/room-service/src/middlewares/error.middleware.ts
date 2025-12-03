import { Request, Response, NextFunction } from "express";
//import { logger } from "../utils";

/**
 * Middleware xử lý lỗi tập trung.
 * Bắt tất cả lỗi được truyền qua next(error) và định dạng
 * response theo cấu trúc { success: false, ... }
 */
export const errorMiddleware = (err: unknown, req: Request, res: Response, _next: NextFunction) => {
	let statusCode = 500;
	let message = "An unexpected error occurred";

	if (err instanceof Error) {
		message = err.message;

		if ("statusCode" in err && typeof err.statusCode === "number") {
			statusCode = err.statusCode;
		}
	}

	// // Chỉ log lỗi 500 ra console
	// if (statusCode >= 500) {
	//     logger.error(`[${req.method}] ${req.path} - 500 Internal Error:`, {
	//         message: message,
	//         errorObject: err instanceof Error ? err.stack : err,
	//     });
	// }

	// Gửi response lỗi đã được định dạng
	res.status(statusCode).json({
		success: false,
		data: null,
		error: message,
	});
};
