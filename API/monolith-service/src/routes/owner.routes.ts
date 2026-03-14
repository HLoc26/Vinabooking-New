import { Router, Request, Response } from "express";
import OwnerController from "@/controllers/owner.controller";
import AccommodationController from "@/controllers/accommodation.controller";
import { authMiddleware } from "@/middlewares/auth.middleware";
import { requireRole } from "@/middlewares/role.middleware";
import { ERole } from "@/generated/client";
import { UpgradeOwnerRequest, CreateAccommodationRequest, UpdateFacilitiesRequest, UpdateAccommodationRequest, UpdateStatusRequest, UpdateAddressRequest } from "@/types/requests";

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

		this.router.post("/accommodations", onlyOwnerGuard, (req: Request, res: Response) => {
			return this.accommodationController.create(req as CreateAccommodationRequest, res);
		});

		this.router.put("/accommodations/:id/facilities", onlyOwnerGuard, (req: Request, res: Response) => {
			return this.accommodationController.updateFacilities(req as UpdateFacilitiesRequest, res);
		});

		this.router.patch("/accommodations/:id", onlyOwnerGuard, (req: Request, res: Response) => {
			return this.accommodationController.updateBasicInfo(req as UpdateAccommodationRequest, res);
		});

		this.router.patch("/accommodations/:id/status", onlyOwnerGuard, (req: Request, res: Response) => {
			return this.accommodationController.updateStatus(req as UpdateStatusRequest, res);
		});

		this.router.put("/accommodations/:id/address", onlyOwnerGuard, (req: Request, res: Response) => {
			return this.accommodationController.updateAddress(req as UpdateAddressRequest, res);
		});
	}
}

export default OwnerRouter;
