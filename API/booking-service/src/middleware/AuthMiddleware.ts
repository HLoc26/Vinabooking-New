import axios from "axios";
import { Request, Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../types/Request";

export class AuthMiddleware {
    static async verifyUser(req: AuthenticatedRequest, res: Response, next: NextFunction) {
        try {
            const authHeader = req.headers.authorization;
            if (!authHeader || !authHeader.startsWith("Bearer ")) {
                return res.status(401).json({ success: false, message: "Missing or invalid Authorization header" });
            }

            const token = authHeader.split(" ")[1];

            // Call your auth-service (change URL to your actual one)
            const response = await axios.post("http://auth-service:3002/verify", {
                token: token, tokenType:"ACCESS"
            });
            // Attach user info to the request for later use
            req.user = response.data.data.user;

            next(); 
        } catch (err: any) {
            console.error(err);
            return res.status(401).json({ success: false, message: "Unauthorized: " + err.message });
        }
    }
}
