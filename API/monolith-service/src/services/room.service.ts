import { ImageDto } from "@/dto/response/image.dto";
import { BadRequestError, NotFoundError } from "@/errors";
import { EntityType } from "@/models/image";
import { RoomRepository } from "@/repositories";
import BookingService from "./booking.service";
import ImageService from "./image.service";
import PricingService from "./pricing.service";
import AccommodationService from "./accommodation.service";

import redisClient from "@/clients/redis.client";
import { AmenityConfig, Bed, Room } from "@/models/room";
import type { DynamicPricingSettings, PricableItem, QuoteItemPricing } from "@/types/pricing.types";
import { CreateRoomDTO, RoomFullDetail, UpdateRoomDTO } from "@/types/room.types";
import { v4 as uuidv4 } from "uuid";

export class RoomService {
	readonly #roomRepository: RoomRepository;
	readonly #bookingService: BookingService;
	readonly #imageService: ImageService;
	readonly #pricingService: PricingService;
	readonly #accommodationService: AccommodationService;
	readonly CACHE_PREFIX = "acc:detail:";

	constructor(
		roomRepository: RoomRepository,
		bookingService: BookingService,
		imageService: ImageService,
		pricingService: PricingService,
		accommodationService: AccommodationService
	) {
		this.#roomRepository = roomRepository;
		this.#bookingService = bookingService;
		this.#imageService = imageService;
		this.#pricingService = pricingService;
		this.#accommodationService = accommodationService;
	}

	// --- Helpers ---

	private async _checkAccommodationOwnership(accommodationId: string, ownerId: string): Promise<void> {
		try {
			const acc = await this.#accommodationService.getAccommodationDomainModel(accommodationId);
			if (!acc.isOwner(ownerId)) {
				throw new BadRequestError("Accommodation not found or unauthorized");
			}
		} catch (error) {
			throw new BadRequestError("Accommodation not found or unauthorized");
		}
	}

	private async _getAccommodationPricingSettings(accommodationIds: string[]): Promise<Map<string, DynamicPricingSettings | null>> {
		const map = new Map<string, DynamicPricingSettings | null>();
		const uniqueIds = [...new Set(accommodationIds)];
		await Promise.all(
			uniqueIds.map(async (accId) => {
				try {
					const acc = await this.#accommodationService.getAccommodationDomainModel(accId);
					map.set(accId, acc.getDynamicPricingSettings());
				} catch {
					map.set(accId, null);
				}
			})
		);
		return map;
	}

	/**
	 * Returns PricableItem data for rooms, used by PricingService.
	 * Includes accommodation dynamicPricingSettings for each room.
	 */
	public async getPricableRoomData(roomIds: string[]): Promise<Map<string, PricableItem>> {
		const rooms = await this.#roomRepository.findManyByIds(roomIds);
		const accIds = rooms.map(r => r.getAccommodationId());
		const settingsMap = await this._getAccommodationPricingSettings(accIds);

		const result = new Map<string, PricableItem>();
		for (const room of rooms) {
			result.set(room.getId(), {
				basePrice: room.getBasePrice(),
				floorPrice: room.getFloorPrice(),
				name: room.getName(),
				accommodationId: room.getAccommodationId(),
				dynamicPricingSettings: settingsMap.get(room.getAccommodationId()) ?? null,
				pricingTypePerNight: room.getPricingType() === "PER_NIGHT",
			});
		}
		return result;
	}

	/**
	 * Returns PricableItem data for beds, used by PricingService.
	 * Includes parent room's pricingType and accommodation pricing settings.
	 */
	public async getPricableBedData(bedIds: string[]): Promise<Map<string, PricableItem>> {
		const result = new Map<string, PricableItem>();
		if (bedIds.length === 0) return result;

		// Use the repository to find beds and their rooms
		const beds = await this.#roomRepository.findBedsByIds(bedIds);
		if (beds.length === 0) return result;

		// Get unique room IDs from beds
		const roomIds = [...new Set(beds.map(b => b.roomId))];
		const rooms = await this.#roomRepository.findManyByIds(roomIds);
		const roomMap = new Map(rooms.map(r => [r.getId(), r]));

		// Get accommodation settings
		const accIds = rooms.map(r => r.getAccommodationId());
		const settingsMap = await this._getAccommodationPricingSettings(accIds);

		for (const bed of beds) {
			const room = roomMap.get(bed.roomId);
			if (!room || !bed.price) continue;

			result.set(bed.id, {
				basePrice: Number(bed.price),
				floorPrice: null,
				name: bed.name,
				accommodationId: room.getAccommodationId(),
				dynamicPricingSettings: settingsMap.get(room.getAccommodationId()) ?? null,
				pricingTypePerNight: room.getPricingType() === "PER_NIGHT",
			});
		}
		return result;
	}

	private async _invalidateAccommodationCacheByRoomId(roomId: string) {
		const room = await this.#roomRepository.findById(roomId);
		if (room) {
			await redisClient.del(`${this.CACHE_PREFIX}${room.getAccommodationId()}`);
		}
	}

	// --- Quản lý Rooms ---

	async getRoomDomainModel(roomId: string): Promise<Room> {
		const room = await this.#roomRepository.findById(roomId);
		if (!room) {
			throw new NotFoundError(`Room with ID ${roomId} not found`);
		}
		return room;
	}

	/**
	 * (R) Lấy thông tin chi tiết một phòng (gồm beds, amenities)
	 */
	async getRoomById(roomId: string, checkIn?: Date, checkOut?: Date) {
		const room = await this.#roomRepository.findById(roomId);

		if (!room) {
			throw new NotFoundError(`Room with ID ${roomId} not found`);
		}

		const result: any = {
			id: room.getId(),
			accommodationId: room.getAccommodationId(),
			name: room.getName(),
			description: room.getDescription(),
			quantity: room.getQuantity(),
			maxAdults: room.getMaxAdults(),
			maxChildren: room.getMaxChildren(),
			size: room.getSize(),
			bedroomCount: room.getBedroomCount(),
			bathroomCount: room.getBathroomCount(),
			viewType: room.getViewType(),
			viewDescription: room.getViewDescription(),
			basePrice: room.getBasePrice(),
			floorPrice: room.getFloorPrice(),
			pricingType: room.getPricingType(),
			isActive: room.getIsActive(),
			beds: room.getBeds().map(b => ({
				id: b.getId(),
				name: b.getName(),
				description: b.getDescription(),
				bedType: b.getBedType(),
				size: b.getSize(),
				quantity: b.getQuantity(),
				price: b.getPrice(),
			})),
			amenities: room.getAmenities().map(a => ({
				id: a.getAmenityId(),
				name: a.getAmenityName(),
				type: a.getAmenityType(),
				description: a.getAmenityDescription(),
				note: a.getNote()
			}))
		};

		if (checkIn && checkOut && this.#pricingService) {
			try {
				const quote = await this.#pricingService.quote({
					checkIn,
					checkOut,
					items: [{ itemType: "ROOM", itemId: roomId, count: 1 }],
				});
				const pricing: QuoteItemPricing | undefined = quote.items[0]?.pricing;
				return { ...result, pricing };
			} catch (err) {
				console.error("[RoomService] pricing.quote failed:", err);
			}
		}
		return result;
	}

	// Room Service
	async getRoomsByMultipleIds(ids: string[]) {
		const rooms = await this.#roomRepository.findManyByIds(ids);
		if (!rooms || rooms.length === 0) {
			throw new NotFoundError("No rooms found...");
		}

		// Map back to expected structure for external calls if necessary
		return rooms.map(room => ({
			id: room.getId(),
			accommodationId: room.getAccommodationId(),
			name: room.getName(),
			quantity: room.getQuantity(),
			maxAdults: room.getMaxAdults(),
			maxChildren: room.getMaxChildren(),
			basePrice: room.getBasePrice(),
			floorPrice: room.getFloorPrice(),
			beds: room.getBeds().map(b => ({ id: b.getId(), quantity: b.getQuantity() }))
		}));
	}

	/**
	 * (R) Lấy tất cả phòng thuộc một accommodation
	 */
	async getRoomsByAccommodationId(accommodationId: string, startDate?: Date, endDate?: Date): Promise<RoomFullDetail[]> {
		const rooms = await this.#roomRepository.findAllByAccommodationId(accommodationId);
		if (rooms.length === 0) return [];

		const roomIds = rooms.map((r) => r.getId());

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
					const images = await this.#imageService.getImage(EntityType.ROOM, room.getId());
					return { roomId: room.getId(), images };
				} catch {
					return { roomId: room.getId(), images: [] };
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
			const totalQuantity = room.getQuantity();
			const bookedCount = bookedMap.get(room.getId()) || 0;
			const remainingQuantity = startDate && endDate ? Math.max(0, totalQuantity - bookedCount) : totalQuantity;
			const images = imagesMap.get(room.getId()) || [];

			return {
				id: room.getId(),
				accommodationId: room.getAccommodationId(),
				name: room.getName(),
				description: room.getDescription(),
				quantity: room.getQuantity(),
				maxAdults: room.getMaxAdults(),
				maxChildren: room.getMaxChildren(),
				size: room.getSize(),
				bedroomCount: room.getBedroomCount(),
				bathroomCount: room.getBathroomCount(),
				viewType: room.getViewType(),
				viewDescription: room.getViewDescription(),
				basePrice: room.getBasePrice(),
				floorPrice: room.getFloorPrice(),
				pricingType: room.getPricingType(),
				isActive: room.getIsActive(),
				beds: room.getBeds().map(b => ({
					id: b.getId(),
					name: b.getName(),
					description: b.getDescription(),
					bedType: b.getBedType(),
					size: b.getSize(),
					quantity: b.getQuantity(),
					price: b.getPrice(),
				})),
				remainingQuantity,
				images,
				pricing: pricingMap.get(room.getId()),
				amenities: room.getAmenities().map((config) => ({
					id: config.getAmenityId(),
					name: config.getAmenityName(),
					type: config.getAmenityType(),
					description: config.getAmenityDescription(),
				})),
			} as unknown as RoomFullDetail;
		});
		return result;
	}

	/**
	 * (C) Tạo một phòng mới (bao gồm cả beds và amenities)
	 */
	async createRoom(ownerId: string, accommodationId: string, data: CreateRoomDTO) {
		// 1. Check Ownership through Service orchestration
		await this._checkAccommodationOwnership(accommodationId, ownerId);

		const roomId = uuidv4();

		// 2. Build Beds (Encapsulating rules in Builder/Model)
		const beds = (data.beds || []).map(b =>
			Bed.builder()
				.setId(uuidv4())
				.setRoomId(roomId)
				.setName(b.name || "New Bed")
				.setDescription(b.description)
				.setBedType(b.bedType)
				.setSize(b.size)
				.setCalculatedQuantity(b.quantity)
				.setPrice(b.price)
				.setIsActive(true)
				.build()
		);

		// 3. Build Amenities
		const amenities = (data.amenityIds || []).map(id =>
			AmenityConfig.builder()
				.setId(uuidv4())
				.setRoomId(roomId)
				.setAmenityId(id)
				.build()
		);

		// 4. Build Room Aggregate
		const room = Room.builder()
			.setId(roomId)
			.setAccommodationId(accommodationId)
			.setName(data.name)
			.setDescription(data.description)
			.setQuantity(data.quantity)
			.setCapacity(data.maxAdults, data.maxChildren)
			.setDimensions(data.size ? Number(data.size) : null, data.bedroomCount, data.bathroomCount)
			.setView(data.viewType, data.viewDescription)
			.setPricing(data.basePrice, data.floorPrice, data.pricingType)
			.setIsActive(data.isActive)
			.setBeds(beds)
			.setAmenities(amenities)
			.build();

		// 5. Persist
		await this.#roomRepository.save(room);

		// 6. Clear Cache
		await redisClient.del(`${this.CACHE_PREFIX}${accommodationId}`);
		await redisClient.del(`owner:dashboard:${ownerId}`);

		return await this.getRoomById(roomId);
	}

	/**
	 * (U) Cập nhật thông tin cơ bản của phòng
	 */
	async updateRoom(ownerId: string, roomId: string, data: UpdateRoomDTO) {
		// 1. Get existing Room
		const room = await this.#roomRepository.findById(roomId);
		if (!room) throw new BadRequestError("Room not found");

		// 2. Check Ownership through Service orchestration
		await this._checkAccommodationOwnership(room.getAccommodationId(), ownerId);

		// 3. Update Room Details
		room.updateDetails({
			name: data.name,
			description: data.description,
			quantity: data.quantity,
			maxAdults: data.maxAdults,
			maxChildren: data.maxChildren,
			size: data.size !== undefined ? Number(data.size) : undefined,
			bedroomCount: data.bedroomCount,
			bathroomCount: data.bathroomCount,
			viewType: data.viewType,
			viewDescription: data.viewDescription,
			basePrice: data.basePrice !== undefined ? Number(data.basePrice) : undefined,
			floorPrice: data.floorPrice !== undefined ? Number(data.floorPrice) : undefined,
			pricingType: data.pricingType,
			isActive: data.isActive
		});

		// 4. Handle Beds Update
		if (data.beds) {
			const existingBeds = room.getBeds();
			const existingBedIds = existingBeds.map(b => b.getId());
			const incomingBeds = data.beds;

			const bedsToKeepAndUpdate = incomingBeds.filter(b => b.id && existingBedIds.includes(b.id));
			const bedsToCreate = incomingBeds.filter(b => !b.id);

			const finalBeds: Bed[] = [];

			// Update existing beds
			for (const bedData of bedsToKeepAndUpdate) {
				const existing = existingBeds.find(b => b.getId() === bedData.id)!;
				existing.updateDetails({
					name: bedData.name,
					description: bedData.description,
					bedType: bedData.bedType as any,
					size: bedData.size,
					quantity: bedData.quantity,
					price: bedData.price !== undefined ? Number(bedData.price) : undefined
				});
				finalBeds.push(existing);
			}

			// Create new beds
			for (const newBed of bedsToCreate) {
				const bed = Bed.builder()
					.setId(uuidv4())
					.setRoomId(room.getId())
					.setName(newBed.name || "New Bed")
					.setDescription(newBed.description)
					.setBedType(newBed.bedType as any)
					.setSize(newBed.size)
					.setCalculatedQuantity(newBed.quantity)
					.setPrice(newBed.price !== undefined ? Number(newBed.price) : undefined)
					.build();
				finalBeds.push(bed);
			}

			room.setBeds(finalBeds);
		}

		// 5. Handle Amenities Update
		if (data.amenityIds) {
			const finalAmenities = data.amenityIds.map(id => {
				const existing = room.getAmenities().find(a => a.getAmenityId() === id);
				if (existing) return existing;

				return AmenityConfig.builder()
					.setId(uuidv4())
					.setRoomId(room.getId())
					.setAmenityId(id)
					.build();
			});
			room.setAmenities(finalAmenities);
		}

		// 6. Persist
		await this.#roomRepository.save(room);

		// 7. Clear Cache
		await redisClient.del(`${this.CACHE_PREFIX}${room.getAccommodationId()}`);

		return await this.getRoomById(roomId);
	}

	/**
	 * (D) Xóa một phòng
	 */
	async deleteRoom(ownerId: string, roomId: string) {
		const room = await this.#roomRepository.findById(roomId);
		if (!room) throw new BadRequestError("Room not found");

		// 1. Check Ownership through Service orchestration
		await this._checkAccommodationOwnership(room.getAccommodationId(), ownerId);

		// 2. Delete via Repository
		await this.#roomRepository.delete(roomId);

		// 3. Delete Images
		await this.#imageService.deleteImagesByEntity(EntityType.ROOM, roomId);

		// 4. Clear Cache
		await redisClient.del(`${this.CACHE_PREFIX}${room.getAccommodationId()}`);
		await redisClient.del(`owner:dashboard:${ownerId}`);

		return {
			id: room.getId(),
			accommodationId: room.getAccommodationId(),
			name: room.getName()
		};
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
