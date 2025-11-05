import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../types/Request";
import AuthServiceClient from "../clients/AuthServiceClient";

export class AuthMiddleware {
    private static authServiceClient: AuthServiceClient;
    constructor() {
        AuthMiddleware.authServiceClient = new AuthServiceClient();
    }

    static async verifyUser(req: AuthenticatedRequest, res: Response, next: NextFunction) {
        try {
            const authHeader = req.headers.authorization;
            if (!authHeader || !authHeader.startsWith("Bearer ")) {
                return res.status(401).json({ success: false, message: "Missing or invalid Authorization header" });
            }

            const token = authHeader.split(" ")[1];

            req.user = await AuthMiddleware.authServiceClient.verify(token);
            next();
        } catch (err: unknown) {
            const e = err as Error;
            console.error(e);
            return res.status(401).json({ success: false, message: "Unauthorized: " + e.message });
        }
    }
}
