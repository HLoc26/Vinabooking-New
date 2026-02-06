import { Request, Response } from "express";
import ResponseHelper from "../utils/response";
import FacilityRepository from "../repositories/facility.repository";

class FacilityController {
	readonly #facilityRepository: FacilityRepository;
	constructor(facilityRepository: FacilityRepository) {
		this.#facilityRepository = facilityRepository;
	}
	public async getAll(req: Request, res: Response) {
		const facilities = await this.#facilityRepository.findAll();
		ResponseHelper.success(res, facilities);
	}
}

export default FacilityController;
