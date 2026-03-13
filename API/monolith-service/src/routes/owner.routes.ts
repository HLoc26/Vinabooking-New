import { Router, Request, Response } from "express";
import OwnerController from "@/controllers/owner.controller";
import AccommodationController from "@/controllers/accommodation.controller";
import { authMiddleware } from "@/middlewares/auth.middleware";
import { requireRole } from "@/middlewares/role.middleware";
import { ERole } from "@/generated/client";
import { UpgradeOwnerRequest } from "@/types/requests";

class OwnerRouter {
	constructor(
		public router: Router,
		private readonly ownerController: OwnerController,
		private readonly accommodationController: AccommodationController
	) {
		this.registerRoutes();
	}

	private registerRoutes() {
		this.router.use(authMiddleware);

		const onlyOwnerGuard = requireRole([ERole.ACCOMMODATION_OWNER]);
		this.router.get("/profile/me", onlyOwnerGuard, (req: Request, res: Response) => {
			return this.ownerController.getMyProfile(req, res);
		});

		this.router.post("/upgrade", (req: Request, res: Response) => {
			return this.ownerController.upgradeRole(req as UpgradeOwnerRequest, res);
		});

		this.router.get("/accommodations", onlyOwnerGuard, (req: Request, res: Response) => {
			return this.accommodationController.getOwnerAccommodations(req, res);
		});
	}
}

export default OwnerRouter;
