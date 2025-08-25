import type { Response } from "express"

class ResponseHelper {

    public static success<T>(res: Response, data: T, statusCode: number = 200) {
        return res.status(statusCode).json({
            success: true,
            data: data,
            error: null
        })
    }

    public static error(res: Response, message: string, statusCode: number = 200) {
        return res.status(statusCode).json({
            success: false,
            data: null,
            error: message
        })
    }
}

export default ResponseHelper;