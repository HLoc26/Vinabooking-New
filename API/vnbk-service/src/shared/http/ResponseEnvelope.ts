import type { Response } from "express";
import type { ApiResponse } from "@/shared/http/ApiResponse";

/**
 * Builds the standard { success, data, error } HTTP envelope.
 * Replaces the monolith ResponseHelper.
 */
export class ResponseEnvelope {
	public static success<T>(res: Response, data: T, statusCode = 200): Response<ApiResponse<T>> {
		return res.status(statusCode).json({ success: true, data, error: null });
	}

	public static error(res: Response, message: string, statusCode = 500): Response<ApiResponse<null>> {
		return res.status(statusCode).json({ success: false, data: null, error: message });
	}
}
