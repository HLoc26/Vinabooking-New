import { Response } from "express";
import RoomService from "@/services/room.service";
import type {
	GetRoomByIdRequest,
	GetRoomsByAccommodationRequest,
	GetRoomsByMultipleIdsRequest,
	CreateRoomRequest,
	UpdateRoomRequest,
	DeleteRoomRequest,
	FilterAccommodationIdsRequest,
} from "@/dto/request";
import ResponseHelper from "@/utils/response";

export class RoomController {
	readonly #roomService: RoomService;

	constructor(roomService: RoomService) {
		this.#roomService = roomService;
	}

	// --- Room management ---

	async getRoomById(req: GetRoomByIdRequest, res: Response) {
		const { id } = req.params;
		const { checkIn, checkOut } = req.query as { checkIn?: string; checkOut?: string };
		try {
			const start = checkIn ? new Date(checkIn) : undefined;
			const end = checkOut ? new Date(checkOut) : undefined;
			const room = await this.#roomService.getRoomById(id, start, end);
			ResponseHelper.success(res, room);
		} catch (error) {
			if (error instanceof Error) ResponseHelper.error(res, error.message, 404);
			else ResponseHelper.error(res, "Unknown error", 500);
		}
	}
	async getRoomsByMultipleIds(req: GetRoomsByMultipleIdsRequest, res: Response) {
		const { id } = req.query;

		if (!id) {
			return ResponseHelper.success(res, []);
		}
		//Chia cai nay ra lam 1 2 3 4
		const ids = (id as string).split(",").map((i: string) => i.trim());

		if (ids.length === 0) {
			return ResponseHelper.success(res, []);
		}

		try {
			const rooms = await this.#roomService.getRoomsByMultipleIds(ids);
			return ResponseHelper.success(res, rooms);
		} catch (error) {
			if (error instanceof Error) ResponseHelper.error(res, error.message, 400);
			else ResponseHelper.error(res, "Unknown error", 500);
		}
	}

	async getRoomsByAccommodationId(req: GetRoomsByAccommodationRequest, res: Response) {
		const { accommodationId } = req.params;
		const { startDate, endDate } = req.query;

		const start = startDate ? new Date(startDate) : undefined;
		const end = endDate ? new Date(endDate) : undefined;

		try {
			const rooms = await this.#roomService.getRoomsByAccommodationId(accommodationId, start, end);

			ResponseHelper.success(res, rooms);
		} catch (error) {
			if (error instanceof Error) ResponseHelper.error(res, error.message, 400);
			else ResponseHelper.error(res, "Unknown error", 500);
		}
	}

	async createRoom(req: CreateRoomRequest, res: Response) {
		const ownerId = req.userId;
		const { accommodationId } = req.params;
		const body = req.body;

		if (!ownerId) {
			return ResponseHelper.error(res, "Unauthorized", 401);
		}

		if (!body.name || !body.basePrice || body.quantity === undefined) {
			return ResponseHelper.error(res, "Missing required fields (name, basePrice, quantity)", 400);
		}
		if (body.floorPrice !== undefined && Number(body.floorPrice) > Number(body.basePrice)) {
			return ResponseHelper.error(res, "floorPrice must be ≤ basePrice", 400);
		}

		if (!body.beds || body.beds.length === 0) {
			return ResponseHelper.error(res, "A room must have at least one bed", 400);
		}

		try {
			const room = await this.#roomService.createRoom(ownerId, accommodationId, body);
			ResponseHelper.success(res, room, 201);
		} catch (error) {
			if (error instanceof Error) ResponseHelper.error(res, error.message, 400);
			else ResponseHelper.error(res, "Unknown error", 500);
		}
	}

	async updateRoom(req: UpdateRoomRequest, res: Response) {
		const ownerId = req.userId;
		const { id } = req.params;
		const body = req.body;

		if (!ownerId) {
			return ResponseHelper.error(res, "Unauthorized", 401);
		}

		if (Object.keys(body).length === 0) {
			return ResponseHelper.error(res, "Empty update body", 400);
		}

		try {
			const updatedRoom = await this.#roomService.updateRoom(ownerId, id, body);
			ResponseHelper.success(res, updatedRoom);
		} catch (error) {
			if (error instanceof Error) ResponseHelper.error(res, error.message, 400);
			else ResponseHelper.error(res, "Unknown error", 500);
		}
	}

	async deleteRoom(req: DeleteRoomRequest, res: Response) {
		const ownerId = req.userId;
		const { id } = req.params;

		if (!ownerId) {
			return ResponseHelper.error(res, "Unauthorized", 401);
		}

		try {
			await this.#roomService.deleteRoom(ownerId, id);
			res.status(204).send();
		} catch (error) {
			if (error instanceof Error) ResponseHelper.error(res, error.message, 400);
			else ResponseHelper.error(res, "Unknown error", 500);
		}
	}

	// --- Internal filter API ---

	async getFilteredAccommodationIds(req: FilterAccommodationIdsRequest, res: Response) {
		const { minPrice, maxPrice, adults, children, sortBy } = req.query;
		try {
			const ids = await this.#roomService.filterAccommodationIds(minPrice, maxPrice, adults, children, sortBy);

			ResponseHelper.success(res, ids);
		} catch (error) {
			if (error instanceof Error) ResponseHelper.error(res, error.message, 400);
			else ResponseHelper.error(res, "Unknown error", 500);
		}
	}
}

export default RoomController;
