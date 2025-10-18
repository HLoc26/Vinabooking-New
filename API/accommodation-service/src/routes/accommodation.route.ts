import express from "express";
import {
    getHealth,
    getAccommodationById,
} from "../controllers/accommodation.controller.js";

const router = express.Router();

router.get("/health", getHealth);
router.get("/:id", getAccommodationById);

export default router;
