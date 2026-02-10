import { Response, NextFunction } from "express";
import RoomService from "@/services/room.service";
import { BadRequestError } from "../errors";

import type {
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
import ResponseHelper from "@/utils/response";

export class RoomController {
	readonly #roomService: RoomService;

	constructor(roomService: RoomService) {
		this.#roomService = roomService;
	}

	// --- Room management ---

	async getRoomById(req: GetRoomByIdRequest, res: Response) {
		const { id } = req.params;
		const room = await this.#roomService.getRoomById(id);
		ResponseHelper.success(res, room);
	}

	async getRoomsByAccommodationId(req: GetRoomsByAccommodationRequest, res: Response) {
		const { accommodationId } = req.params;
		const { startDate, endDate } = req.query;

		const start = startDate ? new Date(startDate) : undefined;
		const end = endDate ? new Date(endDate) : undefined;

		const rooms = await this.#roomService.getRoomsByAccommodationId(accommodationId, start, end);

		ResponseHelper.success(res, rooms);
	}

	async createRoom(req: CreateRoomRequest, res: Response) {
		const room = await this.#roomService.createRoom(req.body);
		ResponseHelper.success(res, room);
	}

	async updateRoom(req: UpdateRoomRequest, res: Response) {
		const { id } = req.params;
		const updatedRoom = await this.#roomService.updateRoom(id, req.body);
		ResponseHelper.success(res, updatedRoom);
	}

	async deleteRoom(req: DeleteRoomRequest, res: Response) {
		const { id } = req.params;
		await this.#roomService.deleteRoom(id);
		res.status(204).send();
	}

	// --- Internal filter API ---

	async getFilteredAccommodationIds(req: FilterAccommodationIdsRequest, res: Response) {
		const { minPrice, maxPrice, adults, children, sortBy } = req.query;

		const ids = await this.#roomService.filterAccommodationIds(minPrice, maxPrice, adults, children, sortBy);

		ResponseHelper.success(res, ids);
	}

	// --- Bed management ---

	async addBedToRoom(req: AddBedToRoomRequest, res: Response) {
		const { roomId } = req.params;

		const bed = await this.#roomService.addBedToRoom(roomId, req.body);

		ResponseHelper.success(res, bed);
	}

	async updateBed(req: UpdateBedRequest, res: Response) {
		const { bedId } = req.params;
		const bed = await this.#roomService.updateBed(bedId, req.body);
		ResponseHelper.success(res.status(201), bed);
	}

	async removeBed(req: RemoveBedRequest, res: Response) {
		const { bedId } = req.params;
		await this.#roomService.removeBed(bedId);
		res.status(204).send();
	}

	// --- Amenity management ---

	async addAmenityToRoom(req: AddAmenityToRoomRequest, res: Response) {
		const { roomId } = req.params;
		const { amenityId, note } = req.body;

		if (!amenityId) {
			throw new BadRequestError("amenityId is required");
		}

		const config = await this.#roomService.addAmenityToRoom(roomId, amenityId, { note });
		ResponseHelper.success(res.status(201), config);
	}

	async removeAmenityFromRoom(req: RemoveAmenityFromRoomRequest, res: Response) {
		const { roomId, amenityId } = req.params;
		await this.#roomService.removeAmenityFromRoom(roomId, amenityId);
		res.status(204).send();
	}
}

export default RoomController;
