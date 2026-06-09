import type { ErrorRequestHandler, Request, Response, NextFunction } from "express";
import { AppError } from "@/shared/error/AppError";
import { ResponseEnvelope } from "@/shared/http/ResponseEnvelope";

/** Global Express error handler — translates AppError (and anything else) into the envelope. */
export class ErrorHandlerMiddleware {
	public static handle: ErrorRequestHandler = (err: unknown, _req: Request, res: Response, _next: NextFunction): void => {
		if (err instanceof AppError) {
			if (err.statusCode >= 500) {
				console.error(err);
			}
			ResponseEnvelope.error(res, err.message, err.statusCode);
			return;
		}

		console.error(err);
		const message = err instanceof Error ? err.message : "Internal Server Error";
		ResponseEnvelope.error(res, message, 500);
	};
}
