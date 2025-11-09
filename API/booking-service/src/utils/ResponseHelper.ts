import type { Response } from "express";
import type { ApiResponse } from "../types/Response";

export default class ResponseHelper {
    static success<T>(res: Response<ApiResponse<T>>, data: T, statusCode = 200) {
        return res.status(statusCode).json({
            success: true,
            data,
        });
    }

    static error(res: Response, message: string, statusCode = 400) {
        return res.status(statusCode).json({
            success: false,
            message,
        });
    }
}
