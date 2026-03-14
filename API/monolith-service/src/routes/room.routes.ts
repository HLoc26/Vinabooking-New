import { Router, Request, Response } from "express";
import RoomController from "@/controllers/room.controller";
import { GetRoomByIdRequest, GetRoomsByAccommodationRequest, GetRoomsByMultipleIdsRequest, FilterAccommodationIdsRequest } from "../types/requests";

class RoomRouter {
	constructor(
		public router: Router,
		private readonly roomController: RoomController
	) {
		this.registerRoutes();
	}

	private registerRoutes() {
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
	}
}

export default RoomRouter;
