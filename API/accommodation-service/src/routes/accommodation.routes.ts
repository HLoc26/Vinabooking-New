import { Router } from "express";
import { accommodationController } from "../controllers/accommodation.controller";

const router = Router();

/**
 * GET /?byEntity=room&entityId=:roomId
 * Get accommodation details by Room ID.
 * Handles other potential filters later if needed.
 */
router.get("/", accommodationController.getAccommodations.bind(accommodationController));

// GET /accommodations/:id
router.get("/:id", accommodationController.getById.bind(accommodationController));

export default router;
