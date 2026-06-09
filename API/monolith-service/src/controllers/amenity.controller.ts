import { Request, Response } from "express";
import ResponseHelper from "../utils/response";
import { AmenityService } from "../services";

class AmenityController {
	readonly #amenityService: AmenityService;

	constructor(amenityService: AmenityService) {
		this.#amenityService = amenityService;
	}

	public async getAll(_req: Request, res: Response) {
		const amenities = await this.#amenityService.getAllAmenities();
		ResponseHelper.success(res, amenities);
	}
}

export default AmenityController;
