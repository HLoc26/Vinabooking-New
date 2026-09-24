import { Request, Response } from "express";
import ResponseHelper from "@/utils/response";
import { FacilityService } from "@/services";

class FacilityController {
	readonly #facilityService: FacilityService;

	constructor(facilityService: FacilityService) {
		this.#facilityService = facilityService;
	}

	public async getAll(req: Request, res: Response) {
		const facilities = await this.#facilityService.getAllFacilities();
		ResponseHelper.success(res, facilities);
	}
}

export default FacilityController;
