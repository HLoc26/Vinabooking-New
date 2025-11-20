import { Router } from "express";
import { accommodationController } from "../controllers/accommodation.controller";

const router = Router();

// GET /stats
router.get("/stats", accommodationController.getHomepageStats.bind(accommodationController));

// GET /count?city=...&type=...
router.get("/count", accommodationController.getCount.bind(accommodationController));

/**
 * GET /?byEntity=room&entityId=:roomId
 * Get accommodation details by Room ID.
 * Handles other potential filters later if needed.
 */
router.get("/", accommodationController.getAccommodations.bind(accommodationController));

// GET /accommodations/:id
router.get("/:id", accommodationController.getById.bind(accommodationController));

export default router;
