import { EntityType } from "@/models/image";
import { ImageDto } from "@/dto/response/image.dto";
import AccommodationRepository from "@/repositories/accommodation.repository";
import { NotFoundError, BadRequestError } from "../errors";
import { RoomService, ImageService, S3Service } from "@/services"; //Double check path
import HolidayRepository from "@/repositories/holiday.repository";
import OwnerRepository from "@/repositories/owner.repository";
import prismaClient from "@/clients/prisma.client";
import { EEntityType, Prisma, type EAccommodationType, type EAccommodationStatus } from "@/generated/client";
import {
	SearchQuery,
	ESortOption,
	AccommodationFullInfo,
	SearchFilters,
	AccommodationWithDetails,
	AccommodationStats,
	CreateAccommodationDTO,
	UpdateFacilitiesDTO,
	UpdateAccommodationDTO,
	UpdateAddressDTO,
	UpdateAccommodationPricingDTO,
	OwnerAccommodationCard,
} from "@/types/accommodation.types";

import redisClient from "@/clients/redis.client";
import { validateDynamicPricingSettings, validateHolidayOptIns } from "@/utils/pricing-validation";
import type { DynamicPricingSettings, HolidayOptIn } from "@/types/pricing.types";

import { publishQueue } from "@/clients/queue.client";
import { PUBLISH_ACCOMMODATION_JOB, type PublishJobData } from "@/types/queue.types";

class AccommodationService {
	readonly #accommodationRepository: AccommodationRepository;
	readonly #roomService: RoomService;
	readonly #imageService: ImageService;
	readonly #s3Service: S3Service;
	readonly #ownerRepository: OwnerRepository;
	readonly #holidayRepository: HolidayRepository;
	readonly CACHE_PREFIX = "acc:detail:";

	constructor(
		accommodationRepository: AccommodationRepository,
		roomService: RoomService,
		imageService: ImageService,
		s3Service: S3Service,
		ownerRepository: OwnerRepository,
		holidayRepository: HolidayRepository
	) {
		this.#accommodationRepository = accommodationRepository;
		this.#roomService = roomService;
		this.#imageService = imageService;
		this.#s3Service = s3Service;
		this.#ownerRepository = ownerRepository;
		this.#holidayRepository = holidayRepository;
	}

	private async _getBaseAccommodations(ids: string[]): Promise<Map<string, AccommodationWithDetails>> {
		const allAccommodationsData = new Map<string, AccommodationWithDetails>();
		if (ids.length === 0) return allAccommodationsData;

		const cachedData = await this.getAccommodationsFromCache(ids);
		const missingIds = ids.filter((id) => !cachedData.get(id));

		cachedData.forEach((acc, id) => allAccommodationsData.set(id, acc));

		if (missingIds.length > 0) {
			const dbData = await this.#accommodationRepository.findByIdBatch(missingIds);
			await this.writeAccommodationsToCache(dbData);
			dbData.forEach((acc) => allAccommodationsData.set(acc.id, acc));
		}

		return allAccommodationsData;
	}

	/**
	 * Hàm gom data chính.
	 * @param preFetchedStats: Truyền vào nếu đã lấy stats từ Search (để tránh query DB 2 lần)
	 */
	async getAccommodationsBatch(ids: string[], preFetchedStats?: AccommodationStats[]): Promise<AccommodationFullInfo[]> {
		if (ids.length === 0) return [];

		// 1. Lấy dữ liệu cơ bản (Tận dụng Cache)
		const baseDataMap = await this._getBaseAccommodations(ids);

		// 2. Xử lý Stats (Nếu search chưa truyền vào thì tự đi lấy)
		let statsRows = preFetchedStats;
		if (!statsRows) {
			// Gọi hàm repo, truyền đủ tham số: filters, offset=0, limit=ids.length
			const result = await this.#accommodationRepository.getStatsRows({ ids }, 0, ids.length);
			statsRows = result.statsRows;
		}

		// 3. Lấy toàn bộ hình ảnh
		const imagesBatch = await this.#imageService.getImagesBatch(EntityType.ACCOMMODATION, ids);
		const imageMap: Record<string, ImageDto[]> = {};
		imagesBatch.forEach((img) => {
			const entityId = img.references[0].entityId;
			if (!imageMap[entityId]) imageMap[entityId] = [];
			imageMap[entityId].push(img);
		});

		// 4. Merge Data & Chuẩn hóa Facilities
		const finalData = ids.map((id) => {
			const acc = baseDataMap.get(id)!;
			const stats = statsRows!.find((s: AccommodationStats) => s.id === id); // Fix undefined potential
			const accImages = imageMap[id] || [];
			const thumbnail = accImages.length > 0 ? this.#s3Service.getS3Url(accImages[0].s3Key) : null;

			return {
				...acc,
				thumbnail,
				images: accImages,
				// Lấy data từ stats (nếu có)
				minPrice: stats?.minPrice ? Number(stats.minPrice) : undefined,
				avgStar: stats?.avgStar ? Number(stats.avgStar) : null,
				reviewCount: Number(stats?.reviewCount || 0),
				// Chuẩn hóa facilities thống nhất cho cả app
				facilities: acc.facilities
					.filter((f) => f.isAvailable) // Đồng bộ logic filter
					.map((f) => ({
						id: f.id,
						name: f.facility.name,
						type: f.facility.type,
						description: f.facility.description,
						fee: Number(f.fee),
						note: f.note,
					})),
			} as unknown as AccommodationFullInfo;
		});

		return finalData;
	}

	async getDraftAccommodationsByOwner(ownerId: string): Promise<AccommodationWithDetails[]> {
		return this.#accommodationRepository.findDraftByOwnerId(ownerId);
	}

	async getOwnerDraftDetails(accommodationId: string, ownerId: string) {
		return this.#accommodationRepository.getOwnerDraftDetails(accommodationId, ownerId);
	}

	async getAccommodationById(id: string): Promise<AccommodationFullInfo> {
		// Gọi qua batch để TẬN DỤNG CACHE và tự động map hình ảnh, stats, facilities!
		const results = await this.getAccommodationsBatch([id]);

		if (!results || results.length === 0) {
			throw new NotFoundError(`Accommodation with ID ${id} not found`);
		}

		return results[0];
	}

	async getAccommodationByRoomId(roomId: string): Promise<AccommodationFullInfo> {
		const accommodationId = (await this.#roomService.getRoomById(roomId)).accommodationId;
		return this.getAccommodationById(accommodationId);
	}

	async getHomepageStats() {
		const [byType, byCity] = await Promise.all([this.#accommodationRepository.countByType(), this.#accommodationRepository.countByCity()]);

		const formattedTypes = byType.map((item) => ({
			type: item.type,
			count: item._count.id,
		}));

		const formattedCities = byCity.map((item) => ({
			city: item.city,
			count: item._count.id,
		}));

		return {
			types: formattedTypes,
			cities: formattedCities,
		};
	}

	async getCount(city?: string, type?: string) {
		const count = await this.#accommodationRepository.count({
			city: city,
			type: type as EAccommodationType,
		});

		return {
			city: city || null,
			type: type || null,
			count: count,
		};
	}

	async writeAccommodationsToCache(accommodation: AccommodationWithDetails[]) {
		const CACHE_TTL = 86400;
		const pipeline = redisClient.multi();

		accommodation.forEach((acc) => {
			pipeline.setEx(`${this.CACHE_PREFIX}${acc.id}`, CACHE_TTL, JSON.stringify(acc));
		});
		const log = await pipeline.exec();
		console.log(log);
	}

	async getAccommodationsFromCache(ids: string[]): Promise<Map<string, AccommodationWithDetails>> {
		const accommMap: Map<string, AccommodationWithDetails> = new Map();
		if (ids.length === 0) return accommMap;

		const accommInCache = await redisClient.mGet(ids.map((id) => `${this.CACHE_PREFIX}${id}`));

		// const cacheHits = accommInCache.filter((item) => item !== null).length;
		// console.log(`Cache request: ${ids.length} | Actual Cache hits: ${cacheHits}`);

		accommInCache.forEach((accommString) => {
			if (!accommString) return;

			const acc: AccommodationWithDetails = JSON.parse(accommString);

			// Make sure object is valid and have an id
			if (acc && acc.id) {
				accommMap.set(acc.id, acc);
			}
		});
		return accommMap;
	}

	/**
	 * SEARCH API (Full Flow)
	 */
	async searchAccommodations(query: SearchQuery): Promise<{
		data: AccommodationFullInfo[];
		meta: { page: number; limit: number; total: number; totalPages: number };
	}> {
		const pageNum = Number(query.page || "1");
		const limitNum = Number(query.limit || "20");
		const offset = (pageNum - 1) * limitNum;

		// 1. Lọc IDs từ phòng trống
		const filteredIds = await this._getInitialFilteredIds(query);
		if (filteredIds?.length === 0) {
			return { data: [], meta: { page: pageNum, limit: limitNum, total: 0, totalPages: 0 } };
		}

		const searchFilters: SearchFilters = {
			keyword: query.keyword,
			type: query.type,
			ids: filteredIds,
			facilities: query.facilities ? (Array.isArray(query.facilities) ? query.facilities : [query.facilities]) : undefined,
		};

		// 2. Gọi SQL Raw để lấy danh sách phân trang và các chỉ số thống kê
		const { statsRows, total } = await this.#accommodationRepository.getStatsRows(searchFilters, offset, limitNum, query.sortBy);
		const paginatedIds = statsRows.map((row) => row.id);

		if (total === 0) {
			return { data: [], meta: { page: pageNum, limit: limitNum, total: 0, totalPages: 0 } };
		}

		// 3. TRUYỀN STATS ROWS VÀO ĐỂ KHÔNG PHẢI QUERY LẠI (Tối ưu x2 tốc độ)
		const finalData = await this.getAccommodationsBatch(paginatedIds, statsRows);

		return {
			data: finalData,
			meta: {
				page: pageNum,
				limit: limitNum,
				total,
				totalPages: Math.ceil(total / limitNum) || 1,
			},
		};
	}

	public async getOwnerAccommodations(ownerId: string): Promise<OwnerAccommodationCard[]> {
		const rawAccommodations = await this.#accommodationRepository.getDashboardCardsByOwnerId(ownerId);

		if (!rawAccommodations || rawAccommodations.length === 0) {
			return [];
		}

		const ids = rawAccommodations.map((acc) => acc.id);

		// Get thubnail
		const imagesBatch = await this.#imageService.getImagesBatch(EntityType.ACCOMMODATION, ids);
		const imageMap: Record<string, string> = {};

		ids.forEach((id) => {
			const accImages = imagesBatch.filter((img) => img.references.some((ref) => ref.entityId === id));

			if (accImages.length > 0) {
				const bestImage = accImages.find((img) => img.references.some((ref) => ref.entityId === id && ref.isPrimary)) ?? accImages[0];
				const thumbnailVariant = bestImage.variants.find((v) => v.variant === "THUMBNAIL");
				imageMap[id] = thumbnailVariant?.url ?? bestImage.url;
			}
		});

		return rawAccommodations.map((acc) => {
			// Tính sao trung bình in-memory
			const validStars = acc.reviews.filter((r) => r.star !== null).map((r) => r.star as number);
			const avgStar = validStars.length > 0 ? Number((validStars.reduce((a, b) => a + b, 0) / validStars.length).toFixed(1)) : null;

			return {
				id: acc.id,
				name: acc.name,
				type: acc.type,
				status: acc.status,
				thumbnail: imageMap[acc.id] ?? null,
				address: acc.address?.fullAddress ?? null,
				roomCount: acc._count.rooms,
				reviewCount: acc._count.reviews,
				avgStar: avgStar,
				updatedAt: acc.updatedAt,
			};
		});
	}

	async createAccommodation(userId: string, data: CreateAccommodationDTO): Promise<AccommodationFullInfo> {
		// Resolve owner profile (needed for dynamic-pricing inheritance).
		const ownerProfile = await this.#ownerRepository.findProfileByUserId(userId);
		if (!ownerProfile) throw new BadRequestError("Owner profile not found");

		// Tri-state dynamicPricingSettings:
		//   undefined → inherit owner defaults
		//   null      → opt-out (no dynamic pricing)
		//   object    → validate + use
		let resolvedSettings: DynamicPricingSettings | null;
		if (data.dynamicPricingSettings === undefined) {
			resolvedSettings = (ownerProfile.getDynamicPricingSettings() as DynamicPricingSettings | null) ?? null;
		} else if (data.dynamicPricingSettings === null) {
			resolvedSettings = null;
		} else {
			validateDynamicPricingSettings(data.dynamicPricingSettings);
			resolvedSettings = data.dynamicPricingSettings;
		}

		// Tri-state holiday opt-ins:
		//   undefined → snapshot OwnerHoliday rows
		//   null      → opt-out (no holiday markups)
		//   array     → validate + use
		const holidayMode: "inherit" | "none" | "explicit" =
			data.holidayOptIns === undefined ? "inherit" : data.holidayOptIns === null ? "none" : "explicit";
		if (holidayMode === "explicit") validateHolidayOptIns(data.holidayOptIns as HolidayOptIn[]);

		const newAccommodationId = await prismaClient.$transaction(async (tx) => {
			const settingsValue: Prisma.NullableJsonNullValueInput | Prisma.InputJsonValue =
				resolvedSettings === null ? Prisma.JsonNull : (resolvedSettings as Prisma.InputJsonValue);

			const created = await tx.accommodation.create({
				data: {
					name: data.name,
					description: data.description,
					type: data.type,
					rentalType: data.rentalType,
					status: "DRAFT",
					dynamicPricingSettings: settingsValue,
					owner: { connect: { id: userId } },
				},
				select: { id: true },
			});

			if (holidayMode === "inherit") {
				await this.#holidayRepository.snapshotOwnerToAccommodation(ownerProfile.getId(), created.id, tx);
			} else if (holidayMode === "explicit") {
				await this.#holidayRepository.replaceForAccommodation(created.id, data.holidayOptIns as HolidayOptIn[], tx);
			}

			return created.id;
		});

		return await this.getAccommodationById(newAccommodationId);
	}

	async updatePricingSettings(userId: string, id: string, data: UpdateAccommodationPricingDTO): Promise<AccommodationFullInfo> {
		const isOwner = await this.#accommodationRepository.checkOwnership(id, userId);
		if (!isOwner) throw new BadRequestError("Accommodation not found or unauthorized");

		if (data.dynamicPricingSettings !== undefined) {
			validateDynamicPricingSettings(data.dynamicPricingSettings);
			await this.#accommodationRepository.updatePricingSettings(id, data.dynamicPricingSettings ?? null);
		}

		if (data.holidayOptIns !== undefined) {
			if (data.holidayOptIns === null) {
				await this.#holidayRepository.replaceForAccommodation(id, []);
			} else {
				validateHolidayOptIns(data.holidayOptIns);
				await this.#holidayRepository.replaceForAccommodation(id, data.holidayOptIns);
			}
		}

		// Spec §2.4 mentions `room:{id}` cache keys, but no code writes them today.
		// Bust the accommodation-detail cache only — re-add per-room invalidation
		// at the same site if/when a room-level cache is introduced.
		await redisClient.del(`${this.CACHE_PREFIX}${id}`);

		return await this.getAccommodationById(id);
	}

	async updateFacilities(ownerId: string, id: string, data: UpdateFacilitiesDTO): Promise<AccommodationFullInfo> {
		const isOwner = await this.#accommodationRepository.checkOwnership(id, ownerId);
		if (!isOwner) throw new BadRequestError("Accommodation not found or unauthorized");

		await this.#accommodationRepository.syncFacilities(id, data.facilities);

		await redisClient.del(`${this.CACHE_PREFIX}${id}`);

		return await this.getAccommodationById(id);
	}

	async updateBasicInfo(ownerId: string, id: string, data: UpdateAccommodationDTO): Promise<AccommodationFullInfo> {
		const isOwner = await this.#accommodationRepository.checkOwnership(id, ownerId);
		if (!isOwner) throw new BadRequestError("Accommodation not found or unauthorized");

		await this.#accommodationRepository.updateBasicInfo(id, data);

		await redisClient.del(`${this.CACHE_PREFIX}${id}`);

		return await this.getAccommodationById(id);
	}

	async updateStatus(ownerId: string, id: string, status: EAccommodationStatus): Promise<AccommodationFullInfo> {
		const isOwner = await this.#accommodationRepository.checkOwnership(id, ownerId);
		if (!isOwner) throw new BadRequestError("Accommodation not found or unauthorized");

		await this.#accommodationRepository.updateStatus(id, status);

		await redisClient.del(`${this.CACHE_PREFIX}${id}`);

		return await this.getAccommodationById(id);
	}

	async publishAccommodation(ownerId: string, id: string): Promise<AccommodationFullInfo> {
		// Lấy raw data từ DB kèm theo các bảng con
		const acc = await this.#accommodationRepository.getForPublishValidation(id, ownerId);

		if (!acc) {
			throw new NotFoundError("Accommodation not found or unauthorized");
		}

		if (acc.status === "PUBLISHED") {
			throw new BadRequestError("This accommodation is already published");
		}

		// ==========================================
		// VALIDATION RULES
		// ==========================================

		// 1. Phải có địa chỉ
		if (!acc.address) {
			throw new BadRequestError("Cannot publish: Missing address information.");
		}

		// 2. Phải có ít nhất 1 phòng
		if (!acc.rooms || acc.rooms.length === 0) {
			throw new BadRequestError("Cannot publish: You must add at least one room.");
		}

		// 3. Quét từng phòng để đảm bảo tính toàn vẹn dữ liệu
		for (const room of acc.rooms) {
			if (!room.basePrice || Number(room.basePrice) <= 0) {
				throw new BadRequestError(`Cannot publish: Room '${room.name}' must have a valid base price greater than 0.`);
			}
			if (Number(room.floorPrice) > Number(room.basePrice)) {
				throw new BadRequestError(`Cannot publish: Room '${room.name}' floor price must be ≤ base price.`);
			}
			if (!room.quantity || room.quantity <= 0) {
				throw new BadRequestError(`Cannot publish: Room '${room.name}' must have a valid quantity.`);
			}
			if (!room.beds || room.beds.length === 0) {
				throw new BadRequestError(`Cannot publish: Room '${room.name}' must have at least one bed.`);
			}
		}

		// ==========================================
		// PASS VALIDATION
		// ==========================================

		await this.#accommodationRepository.updateStatus(id, "PUBLISHED");
		await redisClient.del(`${this.CACHE_PREFIX}${id}`);

		// Trigger indexing onto Pinecone for semantic search
		await publishQueue.add(PUBLISH_ACCOMMODATION_JOB, {
			accommodationId: id,
			name: acc.name,
			type: acc.type,
			lat: Number(acc.address.latitude),
			lon: Number(acc.address.longitude),
			description: acc.description || "",
			facilities: acc.facilities.map((f) => f.facility.name),
		} as PublishJobData);

		return await this.getAccommodationById(id);
	}

	async updateAddress(ownerId: string, id: string, addressData: UpdateAddressDTO): Promise<AccommodationFullInfo> {
		const isOwner = await this.#accommodationRepository.checkOwnership(id, ownerId);
		if (!isOwner) throw new BadRequestError("Accommodation not found or unauthorized");

		await this.#accommodationRepository.updateAddress(id, addressData);

		await redisClient.del(`${this.CACHE_PREFIX}${id}`);

		return await this.getAccommodationById(id);
	}

	// =================================================================
	// PRIVATE HELPER METHODS FOR SEARCH
	// =================================================================

	/**
	 * If room-related filters are present, call Room service to get a pre-filtered list of accommodation IDs.
	 */
	private async _getInitialFilteredIds(query: SearchQuery): Promise<string[] | undefined> {
		const { minPrice, maxPrice, adults, children, sortBy, rooms } = query;
		const needsRoomSort =
			sortBy === ESortOption.PRICE_ASC || sortBy === ESortOption.PRICE_DESC || sortBy === ESortOption.NAME_ASC || sortBy === ESortOption.NAME_DESC || sortBy === ESortOption.RECOMMENDED;

		if (!minPrice && !maxPrice && !adults && !children && !needsRoomSort) {
			return undefined; // No room-related filters, no need to call Room service yet.
		}

		const requiredRooms = rooms ? Number(rooms) : 1;
		const totalAdults = adults ? Number(adults) : 0;
		const totalChildren = children ? Number(children) : 0;

		const adultsPerRoom = totalAdults > 0 ? Math.ceil(totalAdults / requiredRooms) : undefined;
		const childrenPerRoom = totalChildren > 0 ? Math.ceil(totalChildren / requiredRooms) : undefined;

		const result = await this.#roomService.filterAccommodationIds(minPrice ? Number(minPrice) : undefined, maxPrice ? Number(maxPrice) : undefined, adultsPerRoom, childrenPerRoom, sortBy);
		return result || undefined;
	}

	public async getCapacityByOwnerId(ownerId: string) {
		return await this.#accommodationRepository.getRoomsCapacityByOwnerId(ownerId);
	}
}

export default AccommodationService;
