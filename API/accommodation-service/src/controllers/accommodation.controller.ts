import { Request, Response, NextFunction } from "express";
import { accommodationService } from "../services/accommodation.service";

/**
 * GET /accommodations/:id
 * Returns accommodation detail by ID.
 */
export class AccommodationController {
    async getById(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const data = await accommodationService.getAccommodationById(id);
            res.status(200).json({ success: true, data });
        } catch (error) {
            next(error);
        }
    }
}

// Export a singleton instance of the controller
export const accommodationController = new AccommodationController();