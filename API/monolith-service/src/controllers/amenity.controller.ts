import { Request, Response } from "express";
import ResponseHelper from "../utils/response";
import AmenityRepository from "../repositories/amenity.repository";

class AmenityController {
	readonly #amenityRepository: AmenityRepository;
	constructor(amenityRepository: AmenityRepository) {
		this.#amenityRepository = amenityRepository;
	}
	public async getAll(req: Request, res: Response) {
		const amenities = await this.#amenityRepository.findAll();
		ResponseHelper.success(res, amenities);
	}
}

export default AmenityController;
