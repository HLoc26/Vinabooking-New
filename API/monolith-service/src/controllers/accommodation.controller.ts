import { Request, Response } from "express";
import AccommodationService from "../services/accommodation.service";
import ResponseHelper from "../utils/response";

import { GetAccommodationByIdRequest, GetAccommodationByEntityRequest, GetAccommodationCountRequest, SearchAccommodationRequest, PostAccommodationIdsRequest } from "@/types/requests";

class AccommodationController {
	readonly #accommodationService: AccommodationService;

	constructor(accommodationService: AccommodationService) {
		this.#accommodationService = accommodationService;
	}

	/**
	 * GET /accommodations/:id?checkIn=...&checkOut=...
	 */
	public async getById(req: GetAccommodationByIdRequest, res: Response) {
		const { id } = req.params;

		const data = await this.#accommodationService.getAccommodationById(id);

		ResponseHelper.success(res, data);
	}

	/**
	 * GET /accommodations?byEntity=room&entityId=...
	 */
	public async getAccommodations(req: GetAccommodationByEntityRequest, res: Response) {
		const { byEntity, entityId } = req.query;

		if (byEntity === "room" && entityId) {
			const accommodation = await this.#accommodationService.getAccommodationByRoomId(entityId);

			ResponseHelper.success(res, accommodation);
			return;
		}

		ResponseHelper.error(res, "Invalid query parameters");
	}

	/**
	 * POST /accommodations/_mget
	 */
	public async getAccommodationsBatch(req: PostAccommodationIdsRequest, res: Response) {
		const { ids } = req.body;
		const accommodations = await this.#accommodationService.getAccommodationsBatch(ids);
		ResponseHelper.success(res, accommodations);
	}
	/**
	 * GET /accommodations/stats
	 */
	public async getHomepageStats(req: Request, res: Response) {
		const stats = await this.#accommodationService.getHomepageStats();
		ResponseHelper.success(res, stats);
	}

	/**
	 * GET /accommodations/count?city=...&type=...
	 */
	public async getCount(req: GetAccommodationCountRequest, res: Response) {
		const { city, type } = req.query;

		const result = await this.#accommodationService.getCount(city, type);
		ResponseHelper.success(res, result);
	}

	/**
	 * GET /accommodations/search
	 */
	public async search(req: SearchAccommodationRequest, res: Response) {
		const query = req.query;

		// Handle case ALL. If ALL -> undefined -> prisma find all
		if (query.type?.toString() === "ALL") {
			query.type = undefined;
		}

		const result = await this.#accommodationService.searchAccommodations(query);

		ResponseHelper.success(res, result);
	}

	/**
	 * GET /accommodations/owner/me
	 * Lấy danh sách chỗ ở dành riêng cho Dashboard của Owner
	 */
	public async getOwnerAccommodations(req: Request, res: Response) {
		const ownerId = req.userId;

		if (!ownerId) {
			return ResponseHelper.error(res, "Unauthorized", 401);
		}

		const accommodations = await this.#accommodationService.getOwnerAccommodations(ownerId);
		ResponseHelper.success(res, accommodations);
	}
}

export default AccommodationController;
