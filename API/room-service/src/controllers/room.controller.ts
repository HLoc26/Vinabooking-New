import { Request, Response, NextFunction } from "express";
import { roomService } from "../services/room.service";
import { sendSuccess, sendCreated, sendNoContent } from "../utils";

export class RoomController {
    // --- Quản lý Room ---

    /**
     * GET /rooms/:id
     * Lấy chi tiết một phòng theo ID
     */
    async getRoomById(req: Request, res: Response, next: NextFunction) {
        try {
            const roomId = req.params.id;
            const room = await roomService.getRoomById(roomId);
            sendSuccess(res, room);
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /accommodations/:accommodationId/rooms
     * Lấy tất cả phòng thuộc một accommodation
     */
    async getRoomsByAccommodationId(
        req: Request,
        res: Response,
        next: NextFunction
    ) {
        try {
            // Tên param (accommodationId) phải khớp với file routes
            const accommodationId = req.params.accommodationId;
            const rooms =
                await roomService.getRoomsByAccommodationId(accommodationId);
            sendSuccess(res, rooms);
        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /rooms
     * Tạo một phòng mới
     */
    async createRoom(req: Request, res: Response, next: NextFunction) {
        try {
            const newRoom = await roomService.createRoom(req.body);
            sendCreated(res, newRoom);
        } catch (error) {
            next(error);
        }
    }

    /**
     * PATCH /rooms/:id
     * Cập nhật thông tin cơ bản của phòng
     */
    async updateRoom(req: Request, res: Response, next: NextFunction) {
        try {
            const roomId = req.params.id;
            const data = req.body;
            const updatedRoom = await roomService.updateRoom(roomId, data);
            sendSuccess(res, updatedRoom);
        } catch (error) {
            next(error);
        }
    }

    /**
     * DELETE /rooms/:id
     * Xóa một phòng
     */
    async deleteRoom(req: Request, res: Response, next: NextFunction) {
        try {
            const roomId = req.params.id;
            await roomService.deleteRoom(roomId);
            sendNoContent(res);
        } catch (error) {
            next(error);
        }
    }

    // --- Quản lý Bed (thuộc Room) ---

    /**
     * POST /rooms/:roomId/beds
     * Thêm một giường mới vào phòng
     */
    async addBedToRoom(req: Request, res: Response, next: NextFunction) {
        try {
            const roomId = req.params.roomId;
            const bedData = req.body;
            const newBed = await roomService.addBedToRoom(roomId, bedData);
            sendCreated(res, newBed);
        } catch (error) {
            next(error);
        }
    }

    /**
     * PATCH /beds/:bedId
     * Cập nhật thông tin một giường
     */
    async updateBed(req: Request, res: Response, next: NextFunction) {
        try {
            const bedId = req.params.bedId;
            const bedData = req.body;
            const updatedBed = await roomService.updateBed(bedId, bedData);
            sendSuccess(res, updatedBed);
        } catch (error) {
            next(error);
        }
    }

    /**
     * DELETE /beds/:bedId
     * Xóa một giường
     */
    async removeBed(req: Request, res: Response, next: NextFunction) {
        try {
            const bedId = req.params.bedId;
            await roomService.removeBed(bedId);
            sendNoContent(res);
        } catch (error) {
            next(error);
        }
    }

    // --- Quản lý Amenity (thuộc Room) ---

    /**
     * POST /rooms/:roomId/amenities
     * Thêm một tiện nghi vào phòng
     */
    async addAmenityToRoom(req: Request, res: Response, next: NextFunction) {
        try {
            const roomId = req.params.roomId;
            const { amenityId, note } = req.body; // Tách amenityId và note từ body

            if (!amenityId) {
                throw new Error("amenityId is required in the body");
            }

            const newConfig = await roomService.addAmenityToRoom(
                roomId,
                amenityId,
                {
                    note,
                }
            );
            sendCreated(res, newConfig);
        } catch (error) {
            next(error);
        }
    }

    /**
     * DELETE /rooms/:roomId/amenities/:amenityId
     * Xóa một tiện nghi khỏi phòng
     */
    async removeAmenityFromRoom(
        req: Request,
        res: Response,
        next: NextFunction
    ) {
        try {
            const { roomId, amenityId } = req.params; // Lấy cả 2 params từ route
            await roomService.removeAmenityFromRoom(roomId, amenityId);
            sendNoContent(res);
        } catch (error) {
            next(error);
        }
    }
}

// Xuất ra một instance (singleton) của controller
export const roomController = new RoomController();
