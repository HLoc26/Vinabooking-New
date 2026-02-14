import { RoomRepository } from "@/repositories";
import { NotFoundError, BadRequestError } from "@/errors";
import { EEntityType, Prisma } from "@/generated/client";
import BookingService from "./booking.service";
import ImageService from "./image.service";
import { ImageFullInfo } from "@/types/image.types";
import { RoomFullDetail, RoomWithDetails } from "@/types/room.types";

export class RoomService {
	readonly #roomRepository: RoomRepository;
	readonly #bookingService: BookingService;
	readonly #imageService: ImageService;

	constructor(roomRepository: RoomRepository, bookingService: BookingService, imageService: ImageService) {
		this.#roomRepository = roomRepository;
		this.#bookingService = bookingService;
		this.#imageService = imageService;
	}

	/**
	 * (R) Lấy thông tin chi tiết một phòng (gồm beds, amenities)
	 */
	async getRoomById(roomId: string) {
		const room = await this.#roomRepository.findById(roomId);

		if (!room) {
			throw new NotFoundError(`Room with ID ${roomId} not found`);
		}
		return room;
	}
	async getRoomsByMultipleIds(ids: string[]) {
		const rooms = await this.#roomRepository.findManyByIds(ids);
		if (!rooms || rooms.length === 0) {
			throw new NotFoundError(`No rooms found for the provided IDs: ${ids}`);
		}
		return rooms;
	}

	/**
	 * (R) Lấy tất cả phòng thuộc một accommodation
	 */
	async getRoomsByAccommodationId(accommodationId: string, startDate?: Date, endDate?: Date): Promise<RoomFullDetail[]> {
		const rooms = await this.#roomRepository.findAllByAccommodationId(accommodationId);
		if (rooms.length === 0) return [];
		const roomIds = rooms.map((r) => r.id);
		// Task 1: Lấy thông tin Booking (nếu có ngày)
		const bookingTask = (async () => {
			if (startDate && endDate) {
				try {
					return await this.#bookingService.getBookedCounts(roomIds, startDate, endDate);
				} catch (error) {
					console.error("[RoomService] Booking check failed:", error);
					return [];
				}
			}
			return [];
		})();
		// Task 2: Lấy hình ảnh cho từng phòng
		const imagesTask = Promise.all(
			rooms.map(async (room) => {
				try {
					const images = await this.#imageService.getImage(EEntityType.ROOM, room.id);
					return { roomId: room.id, images };
				} catch (error) {
					return { roomId: room.id, images: [] };
				}
			})
		);

		const [bookedCounts, imagesMapList] = await Promise.all([bookingTask, imagesTask]);
		const bookedMap = new Map<string, number>();
		bookedCounts.forEach((item) => bookedMap.set(item.roomId, item.bookedCount));
		const imagesMap = new Map<string, ImageFullInfo[]>();
		imagesMapList.forEach((item) => imagesMap.set(item.roomId, item.images));
		const result = rooms.map((room) => {
			const totalQuantity = room.quantity;
			const bookedCount = bookedMap.get(room.id) || 0;
			const remainingQuantity = startDate && endDate ? Math.max(0, totalQuantity - bookedCount) : totalQuantity;
			// Lấy ảnh tương ứng
			const images = imagesMap.get(room.id) || [];
			return {
				...room,
				remainingQuantity,
				images,
				amenities: room.amenities.map((config) => ({
					id: config.id, //  amenity id (NOT config.id)
					name: config.amenity.name,
					type: config.amenity.type,
					description: config.amenity.description,
				})),
			} as unknown as RoomFullDetail;
		});
		return result;
	}

	/**
	 * (C) Tạo một phòng mới (bao gồm cả beds và amenities)
	 */
	async createRoom(data: Prisma.RoomCreateArgs["data"]) {
		if (!data.accommodationId || !data.name) {
			throw new BadRequestError("Missing required fields: accommodationId, name");
		}

		try {
			const newRoom = await this.#roomRepository.create(data);
			return newRoom;
		} catch (error) {
			if (error instanceof Prisma.PrismaClientKnownRequestError) {
				if (error.code === "P2025") {
					throw new BadRequestError("Invalid data: One or more amenities or the accommodation ID not found");
				}
			}
			throw error;
		}
	}

	/**
	 * (U) Cập nhật thông tin cơ bản của phòng
	 */
	async updateRoom(roomId: string, data: Prisma.RoomUpdateInput) {
		await this.getRoomById(roomId);
		const updatedRoom = await this.#roomRepository.update(roomId, data);
		return updatedRoom;
	}

	/**
	 * (D) Xóa một phòng
	 */
	async deleteRoom(roomId: string) {
		await this.getRoomById(roomId);
		const deletedRoom = await this.#roomRepository.delete(roomId);
		return deletedRoom;
	}

	/**
	 * (*) Lọc accommodationId theo điều kiện giá/người
	 */
	async filterAccommodationIds(minPrice?: number, maxPrice?: number, adults?: number, children?: number, sortBy?: string) {
		return await this.#roomRepository.findAccommodationIdsByFilter({
			minPrice,
			maxPrice,
			adults,
			children,
			sortBy,
		});
	}

	// --- Quản lý Beds ---

	/**
	 * Thêm một giường mới vào phòng
	 */
	async addBedToRoom(roomId: string, bedData: Prisma.BedCreateWithoutRoomInput) {
		await this.getRoomById(roomId);
		const newBed = await this.#roomRepository.addBed(roomId, bedData);
		return newBed;
	}

	/**
	 * Cập nhật thông tin giường
	 */
	async updateBed(bedId: string, bedData: Prisma.BedUpdateInput) {
		try {
			const updatedBed = await this.#roomRepository.updateBed(bedId, bedData);
			return updatedBed;
		} catch (error) {
			if (error instanceof Prisma.PrismaClientKnownRequestError) {
				if (error.code === "P2025") {
					throw new NotFoundError(`Bed with ID ${bedId} not found`);
				}
			}
			throw error;
		}
	}

	/**
	 * Xóa một giường khỏi phòng
	 */
	async removeBed(bedId: string) {
		try {
			const deletedBed = await this.#roomRepository.removeBed(bedId);
			return deletedBed;
		} catch (error) {
			if (error instanceof Prisma.PrismaClientKnownRequestError) {
				if (error.code === "P2025") {
					throw new NotFoundError(`Bed with ID ${bedId} not found`);
				}
			}
			throw error;
		}
	}

	// --- Quản lý Amenities ---

	/**
	 * Thêm một tiện nghi vào phòng
	 */
	async addAmenityToRoom(roomId: string, amenityId: string, data: { note?: string | null }) {
		await this.getRoomById(roomId);

		try {
			const newAmenityConfig = await this.#roomRepository.addAmenity(roomId, amenityId, data);
			return newAmenityConfig;
		} catch (error) {
			if (error instanceof Prisma.PrismaClientKnownRequestError) {
				if (error.code === "P2002") {
					throw new BadRequestError("This amenity already exists in the room");
				}
				if (error.code === "P2025") {
					throw new BadRequestError(`Amenity with ID ${amenityId} not found`);
				}
			}
			throw error;
		}
	}

	/**
	 * Xóa một tiện nghi khỏi phòng
	 */
	async removeAmenityFromRoom(roomId: string, amenityId: string) {
		try {
			const deletedConfig = await this.#roomRepository.removeAmenity(roomId, amenityId);
			return deletedConfig;
		} catch (error) {
			if (error instanceof Prisma.PrismaClientKnownRequestError) {
				if (error.code === "P2025") {
					throw new NotFoundError(`Amenity with ID ${amenityId} not found in room ${roomId}`);
				}
			}
			throw error;
		}
	}
}

export default RoomService;
