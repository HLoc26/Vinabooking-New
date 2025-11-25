import { Router } from "express";
import { roomController } from "../controllers/room.controller";

const router = Router();

// GET /filter-ids
router.get("/filter-ids", roomController.getFilteredAccommodationIds.bind(roomController));

// GET /accommodation/:accommodationId
router.get("/accommodation/:accommodationId", roomController.getRoomsByAccommodationId);

// POST /
router.post("/", roomController.createRoom);

// GET /:id
router.get("/:id", roomController.getRoomById);

// PATCH /:id
router.patch("/:id", roomController.updateRoom);

// DELETE /:id
router.delete("/:id", roomController.deleteRoom);

// POST /:roomId/beds
router.post("/:roomId/beds", roomController.addBedToRoom);

// PATCH /beds/:bedId
router.patch("/beds/:bedId", roomController.updateBed);

// DELETE /beds/:bedId
router.delete("/beds/:bedId", roomController.removeBed);

// POST /:roomId/amenities
router.post("/:roomId/amenities", roomController.addAmenityToRoom);

// DELETE /:roomId/amenities/:amenityId
router.delete("/:roomId/amenities/:amenityId", roomController.removeAmenityFromRoom);

export default router;
