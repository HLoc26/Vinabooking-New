import { Router } from "express";
import type { Request, Response } from "express";
import type { IRouter } from "@/http/IRouter";

/** Composes the health route + every feature router into a single Express router. */
export class AppRouter {
	private readonly _router: Router;

	constructor(routers: IRouter[]) {
		this._router = Router();
		this.registerHealth();
		for (const feature of routers) {
			this._router.use(feature.basePath, feature.router);
		}
	}

	private registerHealth(): void {
		this._router.get("/health", (_req: Request, res: Response) => {
			res.status(200).json({ status: "ok" });
		});
	}

	public get router(): Router {
		return this._router;
	}
}
