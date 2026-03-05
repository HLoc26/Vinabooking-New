import { NextFunction, Request, Response } from "express";
import ResponseHelper from "@/utils/response";
import prismaClient from "@/clients/prisma.client";
import { ERole } from "@/generated/client";

export const requireRole = (allowedRoles: ERole[]) => {
	return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
		try {
			const userId = req.userId;

			if (!userId) {
				ResponseHelper.error(res, "Unauthorized", 401);
				return;
			}

			const user = await prismaClient.user.findUnique({
				where: { id: userId },
				select: { role: true },
			});

			if (!user || !allowedRoles.includes(user.role)) {
				ResponseHelper.error(res, "Forbidden: You do not have permission to perform this action", 403);
				return;
			}

			next();
		} catch (err: unknown) {
			const e = err as Error;
			ResponseHelper.error(res, e.message || "Internal Server Error", 500);
			return;
		}
	};
};
