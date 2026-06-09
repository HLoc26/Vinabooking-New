import { publishQueue } from "@/clients/queue.client";
import redisClient from "@/clients/redis.client";
import { CreateAccommodationDTO, ESortOption, SearchQuery, UpdateAccommodationDTO, UpdateAccommodationPricingDTO, UpdateAddressDTO, UpdateFacilitiesDTO } from "@/dto/request/accommodation.dto";
import { AccommodationFullInfo, AccommodationStats, OwnerAccommodationCard } from "@/dto/response/accommodation.dto";
import { ImageDto } from "@/dto/response/image.dto";
import { BadRequestError, NotFoundError } from "@/errors";
import { AccommodationMapper } from "@/mappers/accommodation.mapper";
import { Accommodation, AccommodationHoliday, AccommodationStatus, AccommodationType, Address, FacilityConfig } from "@/models/accommodation";
import { Facility } from "@/models/facility";
import { EntityType } from "@/models/image";
import { AccommodationRepository } from "@/repositories";
import { ImageService, OwnerService, RoomService, S3Service } from "@/services";
import type { DynamicPricingSettings, HolidayOptIn } from "@/types/pricing.types";
import { PUBLISH_ACCOMMODATION_JOB, type PublishJobData } from "@/types/queue.types";
import { validateDynamicPricingSettings, validateHolidayOptIns } from "@/utils/pricing-validation";

class AccommodationService {
	readonly #accommodationRepository: AccommodationRepository;
	readonly #imageService: ImageService;
	readonly #s3Service: S3Service;
	readonly #ownerService: OwnerService;
	readonly #roomService: RoomService;
	readonly CACHE_PREFIX = "acc:detail:";

	constructor(
		accommodationRepository: AccommodationRepository,
		imageService: ImageService,
		s3Service: S3Service,
		ownerService: OwnerService,
		roomService: RoomService,
	) {
		this.#accommodationRepository = accommodationRepository;
		this.#imageService = imageService;
		this.#s3Service = s3Service;
		this.#ownerService = ownerService;
		this.#roomService = roomService;
	}

	private async _getBaseAccommodations(ids: string[]): Promise<Map<string, Accommodation>> {
		const allAccommodationsData = new Map<string, Accommodation>();
		if (ids.length === 0) return allAccommodationsData;

		// 1. Fetch from Redis
		const keys = ids.map((id) => `${this.CACHE_PREFIX}${id}`);
		const cachedValues = await redisClient.mGet(keys);
		const missingIds: string[] = [];

		cachedValues.forEach((val, index) => {
			if (val) {
				try {
					const domainModel = AccommodationMapper.fromJson(val);
					allAccommodationsData.set(ids[index], domainModel);
				} catch (err) {
					console.error(`Failed to parse cached accommodation ${ids[index]}`, err);
					missingIds.push(ids[index]);
				}
			} else {
				missingIds.push(ids[index]);
			}
		});

		// 2. Fetch missing from DB
		if (missingIds.length > 0) {
			const dbData = await this.#accommodationRepository.findByIdBatch(missingIds);

			// 3. Save to Redis and Map
			const multi = redisClient.multi();
			dbData.forEach((acc) => {
				allAccommodationsData.set(acc.getId(), acc);
				multi.set(`${this.CACHE_PREFIX}${acc.getId()}`, AccommodationMapper.toJson(acc), { EX: 86400 }); // 24h
			});
			await multi.exec();
		}

		return allAccommodationsData;
	}

	async getAccommodationsBatch(ids: string[], preFetchedStats?: AccommodationStats[]): Promise<AccommodationFullInfo[]> {
		if (ids.length === 0) return [];

		const baseDataMap = await this._getBaseAccommodations(ids);

		let statsRows = preFetchedStats;
		if (!statsRows) {
			const result = await this.#accommodationRepository.getStatsRows({ ids }, 0, ids.length);
			statsRows = result.statsRows;
		}

		const imagesBatch = await this.#imageService.getImagesBatch(EntityType.ACCOMMODATION, ids);
		const imageMap: Record<string, ImageDto[]> = {};
		imagesBatch.forEach((img) => {
			const entityId = img.references[0].entityId;
			if (!imageMap[entityId]) imageMap[entityId] = [];
			imageMap[entityId].push(img);
		});

		const finalData = ids.map((id) => {
			const acc = baseDataMap.get(id);
			if (!acc) return null;

			const stats = statsRows!.find((s: AccommodationStats) => s.id === id);
			const accImages = imageMap[id] || [];
			const thumbnail = accImages.length > 0 ? this.#s3Service.getS3Url(accImages[0].s3Key) : null;

			// Map Domain Model to DTO
			return {
				id: acc.getId(),
				name: acc.getName(),
				description: acc.getDescription(),
				type: acc.getType(),
				rentalType: acc.getRentalType(),
				status: acc.getStatus(),
				ownerId: acc.getOwnerId(),
				dynamicPricingSettings: acc.getDynamicPricingSettings(),
				createdAt: acc.getCreatedAt(),
				updatedAt: acc.getUpdatedAt(),
				address: acc.getAddress() ? AccommodationMapper.toAddressPersistence(acc.getAddress()!) : null,
				facilities: acc.getFacilities()
					.filter(f => f.getIsAvailable())
					.map(f => ({
						id: f.getId(),
						name: f.getFacility().getName(),
						type: f.getFacility().getType(),
						description: f.getFacility().getDescription(),
						fee: Number(f.getFee()),
						note: f.getNote(),
					})),
				thumbnail,
				images: accImages,
				minPrice: stats?.minPrice ? Number(stats.minPrice) : undefined,
				avgStar: stats?.avgStar ? Number(stats.avgStar) : null,
				reviewCount: Number(stats?.reviewCount || 0),
			} as unknown as AccommodationFullInfo;
		}).filter(Boolean) as AccommodationFullInfo[];

		return finalData;
	}

	async getDraftAccommodationsByOwner(ownerId: string): Promise<any[]> {
		return this.#accommodationRepository.findDraftByOwnerId(ownerId);
	}

	async getOwnerDraftDetails(accommodationId: string, ownerId: string) {
		return this.#accommodationRepository.getOwnerDraftDetails(accommodationId, ownerId);
	}

	async getAccommodationById(id: string): Promise<AccommodationFullInfo> {
		const results = await this.getAccommodationsBatch([id]);
		if (!results || results.length === 0) {
			throw new NotFoundError(`Accommodation with ID ${id} not found`);
		}
		return results[0];
	}

	async getAccommodationDomainModel(id: string): Promise<Accommodation> {
		const baseDataMap = await this._getBaseAccommodations([id]);
		const acc = baseDataMap.get(id);
		if (!acc) throw new NotFoundError(`Accommodation with ID ${id} not found`);
		return acc;
	}

	async getAccommodationByRoomId(roomId: string): Promise<AccommodationFullInfo> {
		const accommodationId = (await this.#roomService.getRoomDomainModel(roomId)).getAccommodationId();
		return this.getAccommodationById(accommodationId);
	}

	async getHomepageStats() {
		const [byType, byCity] = await Promise.all([this.#accommodationRepository.countByType(), this.#accommodationRepository.countByCity()]);
		return {
			types: byType.map((item) => ({ type: item.type, count: item._count.id })),
			cities: byCity.map((item) => ({ city: item.city, count: item._count.id })),
		};
	}

	async getCount(city?: string, type?: string) {
		const count = await this.#accommodationRepository.count({ city, type: type as AccommodationType });
		return { city: city || null, type: type || null, count };
	}

	async searchAccommodations(query: SearchQuery): Promise<{ data: AccommodationFullInfo[]; meta: { page: number; limit: number; total: number; totalPages: number }; }> {
		const pageNum = Number(query.page || "1");
		const limitNum = Number(query.limit || "20");
		const offset = (pageNum - 1) * limitNum;

		const filteredIds = await this._getInitialFilteredIds(query);
		if (filteredIds?.length === 0) {
			return { data: [], meta: { page: pageNum, limit: limitNum, total: 0, totalPages: 0 } };
		}

		const { statsRows, total } = await this.#accommodationRepository.getStatsRows({
			keyword: query.keyword,
			type: query.type,
			ids: filteredIds,
			facilities: query.facilities ? (Array.isArray(query.facilities) ? query.facilities : [query.facilities]) : undefined,
		}, offset, limitNum, query.sortBy);

		const paginatedIds = statsRows.map((row) => row.id);

		if (total === 0) {
			return { data: [], meta: { page: pageNum, limit: limitNum, total: 0, totalPages: 0 } };
		}

		const finalData = await this.getAccommodationsBatch(paginatedIds, statsRows);

		return { data: finalData, meta: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) || 1 } };
	}

	public async getOwnerAccommodations(ownerId: string): Promise<OwnerAccommodationCard[]> {
		const rawAccommodations = await this.#accommodationRepository.getDashboardCardsByOwnerId(ownerId);
		if (!rawAccommodations || rawAccommodations.length === 0) return [];

		const ids = rawAccommodations.map((acc: any) => acc.id);
		const imagesBatch = await this.#imageService.getImagesBatch(EntityType.ACCOMMODATION, ids);
		const imageMap: Record<string, string> = {};

		ids.forEach((id: string) => {
			const accImages = imagesBatch.filter((img) => img.references.some((ref) => ref.entityId === id));
			if (accImages.length > 0) {
				const bestImage = accImages.find((img) => img.references.some((ref) => ref.entityId === id && ref.isPrimary)) ?? accImages[0];
				const thumbnailVariant = bestImage.variants.find((v) => v.variant === "THUMBNAIL");
				imageMap[id] = thumbnailVariant?.url ?? bestImage.url;
			}
		});

		return rawAccommodations.map((acc: any) => {
			const validStars = acc.reviews.filter((r: any) => r.star !== null).map((r: any) => r.star as number);
			const avgStar = validStars.length > 0 ? Number((validStars.reduce((a: number, b: number) => a + b, 0) / validStars.length).toFixed(1)) : null;

			return {
				id: acc.id,
				name: acc.name,
				type: acc.type,
				status: acc.status,
				thumbnail: imageMap[acc.id] ?? null,
				address: acc.address?.fullAddress ?? null,
				roomCount: acc._count.rooms,
				reviewCount: acc._count.reviews,
				avgStar,
				updatedAt: acc.updatedAt,
			};
		});
	}

	async createAccommodation(userId: string, data: CreateAccommodationDTO): Promise<AccommodationFullInfo> {
		const ownerProfile = await this.#ownerService!.getOwnerProfile(userId);
		if (!ownerProfile) throw new BadRequestError("Owner profile not found");

		let resolvedSettings: DynamicPricingSettings | null;
		if (data.dynamicPricingSettings === undefined) {
			resolvedSettings = (ownerProfile.getDynamicPricingSettings() as DynamicPricingSettings | null) ?? null;
		} else if (data.dynamicPricingSettings === null) {
			resolvedSettings = null;
		} else {
			validateDynamicPricingSettings(data.dynamicPricingSettings);
			resolvedSettings = data.dynamicPricingSettings;
		}

		const holidayMode: "inherit" | "none" | "explicit" = data.holidayOptIns === undefined ? "inherit" : data.holidayOptIns === null ? "none" : "explicit";
		if (holidayMode === "explicit") validateHolidayOptIns(data.holidayOptIns as HolidayOptIn[]);

		const id = require('crypto').randomUUID();

		let holidays: AccommodationHoliday[] = [];
		if (holidayMode === "inherit") {
			holidays = ownerProfile.getOwnerHolidays().map(h =>
				AccommodationHoliday.builder()
					.setId(require('crypto').randomUUID())
					.setAccommodationId(id)
					.setHolidayCode(h.getHolidayCode())
					.setPriceMultiplier(h.getPriceMultiplier())
					.setPreDays(h.getPreDays())
					.setPostDays(h.getPostDays())
					.setEnabled(h.getEnabled())
					.build()
			);
		} else if (holidayMode === "explicit" && data.holidayOptIns) {
			holidays = data.holidayOptIns.map(h =>
				AccommodationHoliday.builder()
					.setId(require('crypto').randomUUID())
					.setAccommodationId(id)
					.setHolidayCode(h.holidayCode)
					.setPriceMultiplier(h.priceMultiplier)
					.setPreDays(h.preDays || 0)
					.setPostDays(h.postDays || 0)
					.setEnabled(h.enabled !== false)
					.build()
			);
		}

		const acc = Accommodation.builder()
			.setId(id)
			.setName(data.name)
			.setDescription(data.description || null)
			.setType(data.type)
			.setRentalType(data.rentalType)
			.setStatus(AccommodationStatus.DRAFT)
			.setOwnerId(userId)
			.setDynamicPricingSettings(resolvedSettings)
			.setHolidayOptIns(holidays)
			.build();

		await this.#accommodationRepository.save(acc);
		await redisClient.del(`owner:dashboard:${userId}`);

		return await this.getAccommodationById(acc.getId());
	}

	async updatePricingSettings(userId: string, id: string, data: UpdateAccommodationPricingDTO): Promise<AccommodationFullInfo> {
		const isOwner = await this.#accommodationRepository.checkOwnership(id, userId);
		if (!isOwner) throw new BadRequestError("Accommodation not found or unauthorized");

		const acc = await this.#accommodationRepository.findById(id);
		if (!acc) throw new NotFoundError("Accommodation not found");

		if (data.dynamicPricingSettings !== undefined) {
			validateDynamicPricingSettings(data.dynamicPricingSettings);
			acc.updateDynamicPricingSettings(data.dynamicPricingSettings ?? null);
		}

		if (data.holidayOptIns !== undefined) {
			if (data.holidayOptIns === null) {
				acc.setHolidayOptIns([]);
			} else {
				validateHolidayOptIns(data.holidayOptIns);
				const holidays = data.holidayOptIns.map(h =>
					AccommodationHoliday.builder()
						.setId(require('crypto').randomUUID())
						.setAccommodationId(id)
						.setHolidayCode(h.holidayCode)
						.setPriceMultiplier(h.priceMultiplier)
						.setPreDays(h.preDays || 0)
						.setPostDays(h.postDays || 0)
						.setEnabled(h.enabled !== false)
						.build()
				);
				acc.setHolidayOptIns(holidays);
			}
		}

		await this.#accommodationRepository.save(acc);
		await redisClient.del(`${this.CACHE_PREFIX}${id}`);

		// Flush holiday maps
		try {
			const keys = await redisClient.keys(`holiday_map:${id}:*`);
			if (keys.length > 0) {
				await redisClient.del(keys);
			}
		} catch (err) {
			console.error(`Failed to flush holiday_map for ${id}`, err);
		}

		return await this.getAccommodationById(id);
	}

	async updateFacilities(ownerId: string, id: string, data: UpdateFacilitiesDTO): Promise<AccommodationFullInfo> {
		const isOwner = await this.#accommodationRepository.checkOwnership(id, ownerId);
		if (!isOwner) throw new BadRequestError("Accommodation not found or unauthorized");

		const acc = await this.#accommodationRepository.findById(id);
		if (!acc) throw new NotFoundError("Accommodation not found");

		// Assuming Facility models can just be created with random placeholders or we need to query them.
		// For now, we will create dummy Facility domain models because the repo just extracts IDs.
		const facilities = data.facilities.map(f => {
			const mockFacility = new Facility(f.facilityId, "", null as any, null, new Date(), new Date());
			return FacilityConfig.builder()
				.setId(require('crypto').randomUUID())
				.setFee(f.fee || 0)
				.setNote(f.note || null)
				.setIsAvailable(f.isAvailable !== false)
				.setFacility(mockFacility)
				.build();
		});

		acc.setFacilities(facilities);
		await this.#accommodationRepository.save(acc);
		await redisClient.del(`${this.CACHE_PREFIX}${id}`);

		return await this.getAccommodationById(id);
	}

	async updateBasicInfo(ownerId: string, id: string, data: UpdateAccommodationDTO): Promise<AccommodationFullInfo> {
		const isOwner = await this.#accommodationRepository.checkOwnership(id, ownerId);
		if (!isOwner) throw new BadRequestError("Accommodation not found or unauthorized");

		const acc = await this.#accommodationRepository.findById(id);
		if (!acc) throw new NotFoundError("Accommodation not found");

		acc.updateBasicInfo(data.name || acc.getName(), data.description || acc.getDescription(), data.type || acc.getType());

		await this.#accommodationRepository.save(acc);
		await redisClient.del(`${this.CACHE_PREFIX}${id}`);

		return await this.getAccommodationById(id);
	}

	async updateStatus(ownerId: string, id: string, status: AccommodationStatus): Promise<AccommodationFullInfo> {
		const isOwner = await this.#accommodationRepository.checkOwnership(id, ownerId);
		if (!isOwner) throw new BadRequestError("Accommodation not found or unauthorized");

		const acc = await this.#accommodationRepository.findById(id);
		if (!acc) throw new NotFoundError("Accommodation not found");

		acc.changeStatus(status);
		await this.#accommodationRepository.save(acc);
		await redisClient.del(`${this.CACHE_PREFIX}${id}`);

		return await this.getAccommodationById(id);
	}

	async publishAccommodation(ownerId: string, id: string): Promise<AccommodationFullInfo> {
		const acc = await this.#accommodationRepository.getForPublishValidation(id, ownerId);

		if (!acc) {
			throw new NotFoundError("Accommodation not found or unauthorized");
		}

		// Domain Model encapsulates validation
		// _count info and room validity was injected by Repository via Mapper
		// The domain method will throw errors if constraints are not met.
		// We injected roomCount and allRoomsValid into the builder inside Mapper.
		const roomCount = (acc as any).roomCount;
		const allRoomsValid = (acc as any).allRoomsValid;

		acc.publish(roomCount, allRoomsValid);

		await this.#accommodationRepository.save(acc);
		await redisClient.del(`${this.CACHE_PREFIX}${id}`);

		await publishQueue.add(PUBLISH_ACCOMMODATION_JOB, {
			accommodationId: id,
			name: acc.getName(),
			type: acc.getType(),
			lat: Number(acc.getAddress()?.getLatitude()),
			lon: Number(acc.getAddress()?.getLongitude()),
			description: acc.getDescription() || "",
			facilities: acc.getFacilities().map((f) => f.getFacility().getName()),
		} as PublishJobData);

		return await this.getAccommodationById(id);
	}

	async updateAddress(ownerId: string, id: string, addressData: UpdateAddressDTO): Promise<AccommodationFullInfo> {
		const isOwner = await this.#accommodationRepository.checkOwnership(id, ownerId);
		if (!isOwner) throw new BadRequestError("Accommodation not found or unauthorized");

		const acc = await this.#accommodationRepository.findById(id);
		if (!acc) throw new NotFoundError("Accommodation not found");

		const addr = Address.builder()
			.setId(acc.getAddress()?.getId() || require('crypto').randomUUID())
			.setStreet(addressData.street)
			.setCity(addressData.city)
			.setCountry(addressData.country)
			.setCountryCode(addressData.countryCode)
			.setPostalCode(addressData.postalCode || null)
			.setLatitude(addressData.latitude || null)
			.setLongitude(addressData.longitude || null)
			.setFullAddress(addressData.fullAddress)
			.setPlaceId(addressData.placeId || null)
			.build();

		acc.setAddress(addr);
		await this.#accommodationRepository.save(acc);
		await redisClient.del(`${this.CACHE_PREFIX}${id}`);

		return await this.getAccommodationById(id);
	}

	private async _getInitialFilteredIds(query: SearchQuery): Promise<string[] | undefined> {
		const { minPrice, maxPrice, adults, children, sortBy, rooms } = query;
		const needsRoomSort =
			sortBy === ESortOption.PRICE_ASC || sortBy === ESortOption.PRICE_DESC || sortBy === ESortOption.NAME_ASC || sortBy === ESortOption.NAME_DESC || sortBy === ESortOption.RECOMMENDED;

		if (!minPrice && !maxPrice && !adults && !children && !needsRoomSort) {
			return undefined;
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
