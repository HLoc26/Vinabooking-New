import { Router, Request, Response } from "express";
import OwnerController from "@/controllers/owner.controller";
import { authMiddleware } from "@/middlewares/auth.middleware";
import { UpgradeOwnerRequest } from "@/types/requests";

class OwnerRouter {
	constructor(
		public router: Router,
		private readonly ownerController: OwnerController
	) {
		this.registerRoutes();
	}

	private registerRoutes() {
		this.router.use(authMiddleware);

		this.router.get("/profile/me", (req: Request, res: Response) => {
			return this.ownerController.getMyProfile(req, res);
		});

		this.router.post("/upgrade", (req: Request, res: Response) => {
			return this.ownerController.upgradeRole(req as UpgradeOwnerRequest, res);
		});
	}
}

export default OwnerRouter;
