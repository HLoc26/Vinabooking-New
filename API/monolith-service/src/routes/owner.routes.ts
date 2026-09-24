import { Router, Request, Response } from "express";
import OwnerController from "@/controllers/owner.controller";
import AccommodationController from "@/controllers/accommodation.controller";
import RoomController from "@/controllers/room.controller";
import { authMiddleware } from "@/middlewares/auth.middleware";
import { requireRole } from "@/middlewares/role.middleware";
import { ERole } from "@/generated/client";
import {
	UpgradeOwnerRequest,
	CreateAccommodationRequest,
	UpdateFacilitiesRequest,
	UpdateAccommodationRequest,
	UpdateStatusRequest,
	UpdateAddressRequest,
	CreateRoomRequest,
	UpdateRoomRequest,
	DeleteRoomRequest,
	GetPolicyRequest,
	UpdatePolicyRequest,
} from "@/dto/request";

class OwnerRouter {
	constructor(
		public router: Router,
		private readonly ownerController: OwnerController,
		private readonly accommodationController: AccommodationController,
		private readonly roomController: RoomController
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

		this.router.get("/bookings", onlyOwnerGuard, (req: Request, res: Response) => {
			return this.ownerController.getBookings(req, res);
		});

		this.router.patch("/bookings/:bookingId/revoke", onlyOwnerGuard, (req: Request, res: Response) => {
			return this.ownerController.revokeBooking(req as Request<{ bookingId: string }>, res);
		});

		this.router.get("/accommodations/drafts", onlyOwnerGuard, (req: Request, res: Response) => {
			return this.ownerController.getDraftAccommodations(req, res);
		});

		this.router.get("/accommodations/:id/draft", onlyOwnerGuard, (req: Request, res: Response) => {
			return this.ownerController.getAccommodationDetail(req as Request<{ id: string }>, res);
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

		this.router.patch("/accommodations/:id/publish", onlyOwnerGuard, (req: Request, res: Response) => {
			return this.accommodationController.publish(req as Request<{ id: string }>, res);
		});

		this.router.put("/accommodations/:id/address", onlyOwnerGuard, (req: Request, res: Response) => {
			return this.accommodationController.updateAddress(req as UpdateAddressRequest, res);
		});

		this.router.patch("/accommodations/:id/pricing-settings", onlyOwnerGuard, (req: Request, res: Response) => {
			return this.accommodationController.updatePricingSettings(req as Request<{ id: string }>, res);
		});

		// Dashboard Stats
		this.router.get("/dashboard/stats", onlyOwnerGuard, (req: Request, res: Response) => {
			return this.ownerController.getDashboardStats(req, res);
		});

		// ==========================================
		// 🛏️ ROOM MANAGEMENT API
		// ==========================================

		// --- Rooms ---
		this.router.post("/accommodations/:accommodationId/rooms", onlyOwnerGuard, (req: Request, res: Response) => {
			return this.roomController.createRoom(req as CreateRoomRequest, res);
		});

		this.router.patch("/rooms/:id", onlyOwnerGuard, (req: Request, res: Response) => {
			return this.roomController.updateRoom(req as UpdateRoomRequest, res);
		});

		this.router.delete("/rooms/:id", onlyOwnerGuard, (req: Request, res: Response) => {
			return this.roomController.deleteRoom(req as DeleteRoomRequest, res);
		});

		this.router.get("/accommodations/:id/policy", onlyOwnerGuard, (req: Request, res: Response) => {
			return this.accommodationController.getPolicy(req as GetPolicyRequest, res);
		});

		this.router.put("/accommodations/:id/policy", onlyOwnerGuard, (req: Request, res: Response) => {
			return this.accommodationController.updatePolicy(req as UpdatePolicyRequest, res);
		});
	}
}

export default OwnerRouter;
