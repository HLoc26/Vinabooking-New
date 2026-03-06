import { Router, Request, Response } from "express";
import RoomController from "@/controllers/room.controller";
import { authMiddleware } from "@/middlewares/auth.middleware";
import { requireRole } from "@/middlewares/role.middleware";
import { ERole } from "@/generated/client";

import {
	GetRoomByIdRequest,
	GetRoomsByAccommodationRequest,
	GetRoomsByMultipleIdsRequest,
	CreateRoomRequest,
	UpdateRoomRequest,
	DeleteRoomRequest,
	FilterAccommodationIdsRequest,
	AddBedToRoomRequest,
	UpdateBedRequest,
	RemoveBedRequest,
	AddAmenityToRoomRequest,
	RemoveAmenityFromRoomRequest,
} from "../types/requests";

class RoomRouter {
	constructor(
		public router: Router,
		private roomController: RoomController
	) {
		this.registerRoutes();
	}

	private registerRoutes() {
		// ==========================================
		// 🟢 PUBLIC API
		// ==========================================

		this.router.get("/filter-ids", (req: Request, res: Response) => {
			return this.roomController.getFilteredAccommodationIds(req as FilterAccommodationIdsRequest, res);
		});

		this.router.get("/accommodation/:accommodationId", (req: Request, res: Response) => {
			return this.roomController.getRoomsByAccommodationId(req as unknown as GetRoomsByAccommodationRequest, res);
		});

		this.router.get("/:id", (req: Request, res: Response) => {
			return this.roomController.getRoomById(req as GetRoomByIdRequest, res);
		});

		this.router.get("/", (req: Request, res: Response) => {
			return this.roomController.getRoomsByMultipleIds(req as GetRoomsByMultipleIdsRequest, res);
		});

		// ==========================================
		// 🔴 SECURE API (Only Owner)
		// ==========================================

		const ownerGuard = [authMiddleware, requireRole([ERole.ACCOMMODATION_OWNER])];

		// --- Rooms ---
		this.router.post("/", ownerGuard, (req: Request, res: Response) => {
			return this.roomController.createRoom(req as CreateRoomRequest, res);
		});

		this.router.patch("/:id", ownerGuard, (req: Request, res: Response) => {
			return this.roomController.updateRoom(req as UpdateRoomRequest, res);
		});

		this.router.delete("/:id", ownerGuard, (req: Request, res: Response) => {
			return this.roomController.deleteRoom(req as DeleteRoomRequest, res);
		});

		// --- Beds ---
		this.router.post("/:roomId/beds", ownerGuard, (req: Request, res: Response) => {
			return this.roomController.addBedToRoom(req as AddBedToRoomRequest, res);
		});

		this.router.patch("/beds/:bedId", ownerGuard, (req: Request, res: Response) => {
			return this.roomController.updateBed(req as UpdateBedRequest, res);
		});

		this.router.delete("/beds/:bedId", ownerGuard, (req: Request, res: Response) => {
			return this.roomController.removeBed(req as RemoveBedRequest, res);
		});

		// --- Amenities ---
		this.router.post("/:roomId/amenities", ownerGuard, (req: Request, res: Response) => {
			return this.roomController.addAmenityToRoom(req as AddAmenityToRoomRequest, res);
		});

		this.router.delete("/:roomId/amenities/:amenityId", ownerGuard, (req: Request, res: Response) => {
			return this.roomController.removeAmenityFromRoom(req as RemoveAmenityFromRoomRequest, res);
		});
	}
}

export default RoomRouter;
