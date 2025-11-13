import { Request, Response, NextFunction } from "express";
import { accommodationService } from "../services/accommodation.service";
import { sendSuccess } from "../utils/apiResponse";
import { BadRequestError } from "../errors";

export class AccommodationController {
	/**
	 * GET /accommodations/:id
	 * Returns accommodation detail by ID.
	 */
	async getById(req: Request, res: Response, next: NextFunction) {
		try {
			const { id } = req.params;
			const data = await accommodationService.getAccommodationById(id);
			sendSuccess(res, data);
		} catch (error) {
			next(error);
		}
	}

	/**
	 * GET /?byEntity=room&entityId=:roomId
	 * Handles getting accommodations, potentially filtered by related entities.
	 */
	async getAccommodations(req: Request, res: Response, next: NextFunction) {
		try {
			const { byEntity, entityId } = req.query;

			// Check if filtering by room ID
			if (byEntity === "room" && entityId) {
				const accommodation = await accommodationService.getAccommodationByRoomId(entityId as string);
				sendSuccess(res, accommodation);
			} else {
				throw new BadRequestError("Unsupported or missing query parameters for filtering.");
			}
		} catch (error) {
			next(error);
		}
	}
}

// Export a singleton instance of the controller
export const accommodationController = new AccommodationController();
