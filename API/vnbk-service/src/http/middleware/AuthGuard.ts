import { inject, injectable } from "tsyringe";
import type { Request, Response, NextFunction } from "express";
import { TOKEN_VERIFIER } from "@/infrastructure/infrastructure.tokens";
import type { ITokenVerifier } from "@/infrastructure/auth-idp/ITokenVerifier";
import { UnauthorizedError } from "@/shared/error/UnauthorizedError";

/**
 * Authenticates a request via the Bearer access token and sets req.userId.
 * Injectable so it can be composed into any router as `this.auth.handle`.
 */
@injectable()
export class AuthGuard {
	constructor(@inject(TOKEN_VERIFIER) private readonly verifier: ITokenVerifier) {}

	public handle = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
		try {
			const authHeader = req.headers["authorization"];
			if (!authHeader || !authHeader.startsWith("Bearer ")) {
				throw new UnauthorizedError("Missing or invalid Authorization header");
			}
			const token = authHeader.split(" ")[1];
			const payload = await this.verifier.verify(token, "access");
			if (!payload?.sub) {
				throw new UnauthorizedError("Invalid token payload");
			}
			req.userId = payload.sub;
			next();
		} catch (err) {
			next(err);
		}
	};
}
