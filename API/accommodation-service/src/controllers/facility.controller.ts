import { Request, Response } from "express";
import { sendSuccess } from "@src/utils/apiResponse";
import { facilityRepository } from "@src/repositories/facility.repository";

export class FacilityController {
	public async getAll(req: Request, res: Response) {
		const facilities = await facilityRepository.findAll();
		sendSuccess(res, facilities);
	}
}

export const facilityController = new FacilityController();
