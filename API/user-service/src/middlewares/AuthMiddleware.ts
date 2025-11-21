import { type Request, type Response, type NextFunction } from "express";
import { AuthServiceClientSingleton } from "../clients/AuthServiceClient";
import ResponseHelper from "../utils/ResponseHelper";

export interface AuthenticatedRequest extends Request {
	user?: {
		id: string;
		username: string;
	};
}

export const authMiddleware = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
	try {
		const authHeader = req.headers["authorization"];
		if (!authHeader || !authHeader.startsWith("Bearer ")) {
			return ResponseHelper.error(res, "Missing or invalid Authorization header", 401);
		}

		const token = authHeader.split(" ")[1];
		const authClient = AuthServiceClientSingleton.getInstance();
		const verifyResult = await authClient.verifyAccessToken(token);

		if (!verifyResult?.data.user) {
			return ResponseHelper.error(res, "Invalid token payload", 401);
		}

		req.user = verifyResult.data.user;
		next();
	} catch (err: unknown) {
		const e = err as Error;
		return ResponseHelper.error(res, e.message || "Unauthorized", 401);
	}
};
