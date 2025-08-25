import Router, { type Request, type Response } from "express";

// Base route: /auth
class AuthRouter {
    public router = Router();

    constructor() {
        this.registerRoutes();
    }

    private registerRoutes() {
        this.router.get("/health", (_req: Request, res: Response) => {
            res.json({ service: "Auth Service", success: true });
        });

        this.router.post("/sign-up");

        this.router.post("/sign-up/confirm");

        this.router.post("/sign-in");

        this.router.get("/refresh-token");

        this.router.post("/sign-out");
    }
}

export default AuthRouter;
