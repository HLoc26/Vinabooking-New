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
	AddBedToRoomRequest,
	UpdateBedRequest,
	RemoveBedRequest,
	AddAmenityToRoomRequest,
	RemoveAmenityFromRoomRequest,
} from "@/types/requests";

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

		// --- Beds ---
		this.router.post("/rooms/:roomId/beds", onlyOwnerGuard, (req: Request, res: Response) => {
			return this.roomController.addBedToRoom(req as AddBedToRoomRequest, res);
		});

		this.router.patch("/beds/:bedId", onlyOwnerGuard, (req: Request, res: Response) => {
			return this.roomController.updateBed(req as UpdateBedRequest, res);
		});

		this.router.delete("/beds/:bedId", onlyOwnerGuard, (req: Request, res: Response) => {
			return this.roomController.removeBed(req as RemoveBedRequest, res);
		});

		// --- Amenities ---
		this.router.post("/rooms/:roomId/amenities", onlyOwnerGuard, (req: Request, res: Response) => {
			return this.roomController.addAmenityToRoom(req as AddAmenityToRoomRequest, res);
		});

		this.router.delete("/rooms/:roomId/amenities/:amenityId", onlyOwnerGuard, (req: Request, res: Response) => {
			return this.roomController.removeAmenityFromRoom(req as RemoveAmenityFromRoomRequest, res);
		});
	}
}

export default OwnerRouter;
