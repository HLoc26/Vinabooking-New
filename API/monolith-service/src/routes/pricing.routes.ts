import { Router, Request, Response } from "express";
import PricingController from "@/controllers/pricing.controller";
import { authMiddleware } from "@/middlewares/auth.middleware";
import { requireRole } from "@/middlewares/role.middleware";
import { ERole } from "@/generated/client";

class PricingRouter {
	constructor(
		public router: Router,
		private readonly pricingController: PricingController
	) {
		this.registerRoutes();
	}

	private registerRoutes() {
		const ownerGuard = [authMiddleware, requireRole([ERole.ACCOMMODATION_OWNER])];

		// Public
		this.router.get("/holidays", (req: Request, res: Response) => {
			return this.pricingController.getHolidayCatalog(req, res);
		});

		this.router.post("/quote", (req: Request, res: Response) => {
			return this.pricingController.quote(req, res);
		});

		// Owner-wide settings
		this.router.get("/owners/me/settings", ...ownerGuard, (req: Request, res: Response) => {
			return this.pricingController.getOwnerSettings(req, res);
		});

		this.router.patch("/owners/me/settings", ...ownerGuard, (req: Request, res: Response) => {
			return this.pricingController.updateOwnerSettings(req, res);
		});

		this.router.get("/owners/me/holidays", ...ownerGuard, (req: Request, res: Response) => {
			return this.pricingController.getOwnerHolidays(req, res);
		});

		this.router.put("/owners/me/holidays", ...ownerGuard, (req: Request, res: Response) => {
			return this.pricingController.replaceOwnerHolidays(req, res);
		});

		this.router.post("/owners/me/sync-accommodations", ...ownerGuard, (req: Request, res: Response) => {
			return this.pricingController.syncAllAccommodations(req, res);
		});
	}
}

export default PricingRouter;
