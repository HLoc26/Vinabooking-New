import { NextFunction, Request, Response } from "express";
import ResponseHelper from "@/utils/response";
import prismaClient from "@/clients/prisma.client";
import { ERole } from "@/generated/client";
import redisClient from "@/clients/redis.client";

export const requireRole = (allowedRoles: ERole[]) => {
	return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
		try {
			const userId = req.userId;

			if (!userId) {
				ResponseHelper.error(res, "Unauthorized", 401);
				return;
			}

			const cacheKey = `user:${userId}:role`;
			let userRole: string | null = null;

			try {
				userRole = await redisClient.get(cacheKey);
			} catch (redisErr) {
				console.error(`[Redis] Failed to get role cache for user ${userId}:`, redisErr);
			}

			if (!userRole) {
				const user = await prismaClient.user.findUnique({
					where: { id: userId },
					select: { role: true },
				});

				if (!user) {
					ResponseHelper.error(res, "Forbidden: You do not have permission to perform this action", 403);
					return;
				}

				userRole = user.role;

				try {
					await redisClient.set(cacheKey, userRole, { EX: 3600 });
				} catch (redisErr) {
					console.error(`[Redis] Failed to set role cache for user ${userId}:`, redisErr);
				}
			}

			if (!allowedRoles.includes(userRole as ERole)) {
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
