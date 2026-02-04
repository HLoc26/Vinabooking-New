import { Router, Request, Response } from "express";
import RoomController from "@/controllers/room.controller";
import {
	GetRoomByIdRequest,
	GetRoomsByAccommodationRequest,
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
		// --- Filter ---
		this.router.get("/filter-ids", (req: Request, res: Response) => {
			return this.roomController.getFilteredAccommodationIds(req as FilterAccommodationIdsRequest, res);
		});

		// --- Rooms ---
		this.router.get("/accommodation/:accommodationId", (req: Request, res: Response) => {
			return this.roomController.getRoomsByAccommodationId(req as unknown as GetRoomsByAccommodationRequest, res); //type get from params, can change later
		});

		this.router.post("/", (req: Request, res: Response) => {
			return this.roomController.createRoom(req as CreateRoomRequest, res);
		});

		this.router.get("/:id", (req: Request, res: Response) => {
			return this.roomController.getRoomById(req as GetRoomByIdRequest, res);
		});

		this.router.patch("/:id", (req: Request, res: Response) => {
			return this.roomController.updateRoom(req as UpdateRoomRequest, res);
		});

		this.router.delete("/:id", (req: Request, res: Response) => {
			return this.roomController.deleteRoom(req as DeleteRoomRequest, res);
		});

		// --- Beds ---
		this.router.post("/:roomId/beds", (req: Request, res: Response) => {
			return this.roomController.addBedToRoom(req as AddBedToRoomRequest, res);
		});

		this.router.patch("/beds/:bedId", (req: Request, res: Response) => {
			return this.roomController.updateBed(req as UpdateBedRequest, res);
		});

		this.router.delete("/beds/:bedId", (req: Request, res: Response) => {
			return this.roomController.removeBed(req as RemoveBedRequest, res);
		});

		// --- Amenities ---
		this.router.post("/:roomId/amenities", (req: Request, res: Response) => {
			return this.roomController.addAmenityToRoom(req as AddAmenityToRoomRequest, res);
		});

		this.router.delete("/:roomId/amenities/:amenityId", (req: Request, res: Response) => {
			return this.roomController.removeAmenityFromRoom(req as RemoveAmenityFromRoomRequest, res);
		});
	}
}

export default RoomRouter;
