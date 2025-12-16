import { Router } from "express";
import { facilityController } from "..//controllers/facility.controller";

const router = Router();

// GET /facilities
router.get("/facilities", facilityController.getAll.bind(facilityController));
export default router;
