import { Request, Response, NextFunction } from "express";

export const errorMiddleware = (
    err: Error & { statusCode?: number },
    _req: Request,
    res: Response,
    _next: NextFunction
) => {
    console.error(`[ERROR] ${err.name}: ${err.message}`);

    const status = err.statusCode ?? 500;
    const message = err.message ?? "Internal Server Error";

    res.status(status).json({
        success: false,
        error: {
            name: err.name,
            message,
        },
    });
};
