import { AuthPayload } from "@/types/auth/auth-payload";
import JwtService from "@/utils/jwt";
import ResponseHelper from "@/utils/response";
import { NextFunction, Request, Response } from "express";

export const authMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	try {
		const authHeader = req.headers["authorization"];
		if (!authHeader || !authHeader.startsWith("Bearer ")) {
			ResponseHelper.error(res, "Missing or invalid Authorization header", 401);
			return;
		}

		const token = authHeader.split(" ")[1];
		const verifyResult = await JwtService.verifyToken(token, "access");

		const payload: AuthPayload = {
			id: verifyResult.sub,
		};

		if (!payload?.id) {
			ResponseHelper.error(res, "Invalid token payload", 401);
			return;
		}

		// req.user is typed (from express.d.ts)
		req.userId = payload.id;

		next();
	} catch (err: unknown) {
		const e = err as Error;
		ResponseHelper.error(res, e.message || "Unauthorized", 401);
		return;
	}
};
