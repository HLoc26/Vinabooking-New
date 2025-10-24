import { Router } from "express";
import { accommodationController } from "../controllers/accommodation.controller";

const router = Router();

// GET /accommodations/:id
router.get(
    "/:id",
    accommodationController.getById.bind(accommodationController)
);

export default router;
