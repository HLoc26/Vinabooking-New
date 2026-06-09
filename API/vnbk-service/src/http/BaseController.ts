import type { Request, Response, NextFunction, RequestHandler } from "express";
import { ResponseEnvelope } from "@/shared/http/ResponseEnvelope";
import { HttpResult } from "@/http/HttpResult";
import { UnauthorizedError } from "@/shared/error/UnauthorizedError";

/**
 * Template Method base for all controllers. `handle` runs a typed async handler,
 * wraps its HttpResult in the standard envelope, and forwards thrown errors to
 * the global ErrorHandlerMiddleware — eliminating per-method try/catch.
 */
export abstract class BaseController {
	protected ok<T>(body: T): HttpResult<T> {
		return new HttpResult(200, body);
	}

	protected created<T>(body: T): HttpResult<T> {
		return new HttpResult(201, body);
	}

	/** Reads the authenticated user id set by AuthGuard, or throws 401. */
	protected requireUserId(req: Request): string {
		if (!req.userId) {
			throw new UnauthorizedError("User is not authenticated");
		}
		return req.userId;
	}

	protected handle<T>(fn: (req: Request) => Promise<HttpResult<T>>): RequestHandler {
		return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
			try {
				const result = await fn(req);
				ResponseEnvelope.success(res, result.body, result.status);
			} catch (err) {
				next(err);
			}
		};
	}
}
