import prisma from "../prisma/client";
import { Prisma } from "@prisma/client";

export class RoomRepository {
    /**
     * (R) Tìm một Room bằng ID.
     * Bao gồm cả Beds và Amenities chi tiết.
     */
    async findById(roomId: string) {
        return prisma.room.findUnique({
            where: { id: roomId },
            include: {
                beds: true,
                amenities: {
                    include: {
                        amenity: true,
                    },
                },
            },
        });
    }

    /**
     * (R) Tìm TẤT CẢ Rooms thuộc một Accommodation.
     */
    async findAllByAccommodationId(accommodationId: string) {
        return prisma.room.findMany({
            where: {
                accommodationId: accommodationId,
            },
            include: {
                beds: true,
                amenities: {
                    include: { amenity: true },
                },
            },
            orderBy: {
                createdAt: "asc",
            },
        });
    }

    /**
     * (C) Tạo một Room mới (bao gồm nested Beds và Amenities).
     * `data` được truyền từ service.
     */
    async create(data: Prisma.RoomCreateArgs["data"]) {
        return prisma.room.create({
            data: data,
            include: {
                beds: true,
                amenities: { include: { amenity: true } },
            },
        });
    }

    /**
     * (U) Cập nhật thông tin cơ bản của Room.
     */
    async update(roomId: string, data: Prisma.RoomUpdateInput) {
        return prisma.room.update({
            where: { id: roomId },
            data: data,
            include: {
                beds: true,
                amenities: { include: { amenity: true } },
            },
        });
    }

    /**
     * (D) Xóa một Room.
     */
    async delete(roomId: string) {
        return prisma.room.delete({
            where: { id: roomId },
        });
    }

    // --- Quản lý Bed ---

    /**
     * (C) Thêm một Bed vào Room.
     */
    async addBed(roomId: string, bedData: Prisma.BedCreateWithoutRoomInput) {
        return prisma.bed.create({
            data: {
                ...bedData,
                roomId: roomId, // Gán roomId
            },
        });
    }

    /**
     * (U) Cập nhật một Bed.
     */
    async updateBed(bedId: string, bedData: Prisma.BedUpdateInput) {
        return prisma.bed.update({
            where: { id: bedId },
            data: bedData,
        });
    }

    /**
     * (D) Xóa một Bed.
     */
    async removeBed(bedId: string) {
        return prisma.bed.delete({
            where: { id: bedId },
        });
    }

    // --- Quản lý AmenityConfig ---

    /**
     * (C) Thêm một Amenity vào Room (tạo AmenityConfig).
     */
    async addAmenity(
        roomId: string,
        amenityId: string,
        data: { note?: string | null }
    ) {
        return prisma.amenityConfig.create({
            data: {
                roomId: roomId,
                amenityId: amenityId,
                note: data.note,
            },
            include: {
                amenity: true,
            },
        });
    }

    /**
     * (D) Xóa một Amenity khỏi Room (xóa AmenityConfig).
     */
    async removeAmenity(roomId: string, amenityId: string) {
        return prisma.amenityConfig.delete({
            where: {
                roomId_amenityId: {
                    roomId: roomId,
                    amenityId: amenityId,
                },
            },
        });
    }
}

// Xuất ra một instance (singleton) của repository
export const roomRepository = new RoomRepository();
