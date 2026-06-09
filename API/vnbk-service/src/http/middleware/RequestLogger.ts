import type { Request, Response, NextFunction, RequestHandler } from "express";

/** Logs each incoming request (parity with the monolith's inline logger). */
export class RequestLogger {
	public static handle: RequestHandler = (req: Request, _res: Response, next: NextFunction): void => {
		console.log(`Incoming request: ${req.method} ${req.url}`);
		next();
	};
}
