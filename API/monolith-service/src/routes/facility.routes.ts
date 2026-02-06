import { Router } from "express";
import FacilityController from "../controllers/facility.controller";
import FacilityRepository from "../repositories/facility.repository";
import prismaClient from "../clients/prisma.client"; // adjust path if needed

const router = Router();

// --- Dependency Injection ---
const facilityRepository = new FacilityRepository(prismaClient);
const facilityController = new FacilityController(facilityRepository);

// --- Routes ---
router.get("/", facilityController.getAll.bind(facilityController));

export default router;

//IDK this looks fun
