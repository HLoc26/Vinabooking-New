import { Request, Response } from "express";
import { sendSuccess } from "../utils/apiResponse";
import { facilityRepository } from "../repositories/facility.repository";

export class FacilityController {
	public async getAll(req: Request, res: Response) {
		const facilities = await facilityRepository.findAll();
		sendSuccess(res, facilities);
	}
}

export const facilityController = new FacilityController();
