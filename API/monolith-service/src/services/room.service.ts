import { EntityType } from "@/models/image";
import { ImageDto } from "@/dto/response/image.dto";
import { RoomRepository } from "@/repositories";
import { NotFoundError, BadRequestError } from "@/errors";
import { EEntityType } from "@/generated/client";
import BookingService from "./booking.service";
import ImageService from "./image.service";
import PricingService from "./pricing.service";

import { RoomFullDetail, CreateRoomDTO, UpdateRoomDTO } from "@/types/room.types";
import type { QuoteItemPricing } from "@/types/pricing.types";
import redisClient from "@/clients/redis.client";

export class RoomService {
	readonly #roomRepository: RoomRepository;
	readonly #bookingService: BookingService;
	readonly #imageService: ImageService;
	#pricingService?: PricingService;
	readonly CACHE_PREFIX = "acc:detail:";

	constructor(roomRepository: RoomRepository, bookingService: BookingService, imageService: ImageService) {
		this.#roomRepository = roomRepository;
		this.#bookingService = bookingService;
		this.#imageService = imageService;
	}

	public setPricingService(pricingService: PricingService) {
		this.#pricingService = pricingService;
	}

	// --- Helpers ---

	private async _invalidateAccommodationCacheByRoomId(roomId: string) {
		const room = await this.#roomRepository.findById(roomId);
		if (room) {
			await redisClient.del(`${this.CACHE_PREFIX}${room.accommodationId}`);
		}
	}

	// --- Quản lý Rooms ---

	/**
	 * (R) Lấy thông tin chi tiết một phòng (gồm beds, amenities)
	 */
	async getRoomById(roomId: string, checkIn?: Date, checkOut?: Date) {
		const room = await this.#roomRepository.findById(roomId);

		if (!room) {
			throw new NotFoundError(`Room with ID ${roomId} not found`);
		}
		if (checkIn && checkOut && this.#pricingService) {
			try {
				const quote = await this.#pricingService.quote({
					checkIn,
					checkOut,
					items: [{ itemType: "ROOM", itemId: roomId, count: 1 }],
				});
				const pricing: QuoteItemPricing | undefined = quote.items[0]?.pricing;
				return { ...room, pricing };
			} catch (err) {
				console.error("[RoomService] pricing.quote failed:", err);
			}
		}
		return room;
	}
	// Room Service
	async getRoomsByMultipleIds(ids: string[]) {
		const rooms = await this.#roomRepository.findManyByIds(ids);
		if (!rooms || rooms.length === 0) {
			throw new NotFoundError("No rooms found...");
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
					const images = await this.#imageService.getImage(EntityType.ROOM, room.id);
					return { roomId: room.id, images };
				} catch {
					return { roomId: room.id, images: [] };
				}
			})
		);

		const [bookedCounts, imagesMapList] = await Promise.all([bookingTask, imagesTask]);
		const bookedMap = new Map<string, number>();
		bookedCounts.forEach((item) => bookedMap.set(item.roomId, item.bookedCount));
		const imagesMap = new Map<string, ImageDto[]>();
		imagesMapList.forEach((item) => imagesMap.set(item.roomId, item.images));

		const pricingMap = new Map<string, QuoteItemPricing>();
		if (startDate && endDate && this.#pricingService) {
			try {
				const quote = await this.#pricingService.quote({
					checkIn: startDate,
					checkOut: endDate,
					items: roomIds.map((id) => ({ itemType: "ROOM" as const, itemId: id, count: 1 })),
				});
				for (const it of quote.items) pricingMap.set(it.itemId, it.pricing);
			} catch (err) {
				console.error("[RoomService] batch pricing.quote failed:", err);
			}
		}

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
				pricing: pricingMap.get(room.id),
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
	async createRoom(ownerId: string, accommodationId: string, data: CreateRoomDTO) {
		// 1. Check Ownership
		const isOwner = await this.#roomRepository.checkAccommodationOwnership(accommodationId, ownerId);
		if (!isOwner) throw new BadRequestError("Accommodation not found or unauthorized");

		// 2. Create
		const newRoom = await this.#roomRepository.create(accommodationId, data);

		// 3. Clear Cache
		await redisClient.del(`${this.CACHE_PREFIX}${accommodationId}`);

		return newRoom;
	}

	/**
	 * (U) Cập nhật thông tin cơ bản của phòng
	 */
	async updateRoom(ownerId: string, roomId: string, data: UpdateRoomDTO) {
		// 1. Check Ownership
		const isOwner = await this.#roomRepository.checkRoomOwnership(roomId, ownerId);
		if (!isOwner) throw new BadRequestError("Room not found or unauthorized");

		// 2. Update
		const updatedRoom = await this.#roomRepository.updateRoomAtCreate(roomId, data);

		// 3. Clear Cache
		await redisClient.del(`${this.CACHE_PREFIX}${updatedRoom.accommodationId}`);

		return updatedRoom;
	}

	/**
	 * (D) Xóa một phòng
	 */
	async deleteRoom(ownerId: string, roomId: string) {
		// 1. Check Ownership
		const isOwner = await this.#roomRepository.checkRoomOwnership(roomId, ownerId);
		if (!isOwner) throw new BadRequestError("Room not found or unauthorized");

		// 2. Delete
		const room = await this.getRoomById(roomId);
		const deletedRoom = await this.#roomRepository.delete(roomId);

		// 3. Delete Images
		await this.#imageService.deleteImagesByEntity(EntityType.ROOM, roomId);

		// 4. Clear Cache
		await redisClient.del(`${this.CACHE_PREFIX}${room.accommodationId}`);

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
}

export default RoomService;
