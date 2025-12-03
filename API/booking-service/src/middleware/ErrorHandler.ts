import type { Request, Response, NextFunction } from "express";
import BaseError from "../errors/BaseError";
import ResponseHelper from "../utils/ResponseHelper";

export default function ErrorHandler(err: Error | BaseError, _req: Request, res: Response, _next: NextFunction) {
	if (err instanceof BaseError) {
		return ResponseHelper.error(res, err.message, err.statusCode);
	}

	console.error("Unhandled error:", err);
	return ResponseHelper.error(res, "Internal Server Error", 500);
}
