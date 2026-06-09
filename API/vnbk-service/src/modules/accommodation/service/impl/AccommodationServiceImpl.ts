import { inject, injectable } from "tsyringe";
import type { IAccommodationService } from "@/modules/accommodation/service/IAccommodationService";
import { ACCOMMODATION_REPOSITORY } from "@/modules/accommodation/accommodation.tokens";
import type {
	IAccommodationRepository,
	SearchFilters,
	AccommodationStatsRow,
	HolidayMode,
	HolidayOptInData,
} from "@/modules/accommodation/repository/IAccommodationRepository";
import { Accommodation } from "@/modules/accommodation/domain/Accommodation";
import { EAccommodationStatus } from "@/modules/accommodation/enums/EAccommodationStatus";
import type { EAccommodationType } from "@/modules/accommodation/enums/EAccommodationType";
import { ESortOption } from "@/modules/accommodation/enums/ESortOption";
import { AccommodationDtoMapper } from "@/modules/accommodation/rest/mapper/AccommodationDtoMapper";
import { AccommodationCacheCodec } from "@/modules/accommodation/service/impl/AccommodationCacheCodec";
import type { AccommodationResponse } from "@/modules/accommodation/dto/response/AccommodationResponse";
import type { AccommodationSearchResponse } from "@/modules/accommodation/dto/response/AccommodationSearchResponse";
import type { AccommodationCountResponse } from "@/modules/accommodation/dto/response/AccommodationCountResponse";
import type { HomepageStatsResponse } from "@/modules/accommodation/dto/response/HomepageStatsResponse";
import type { CreateAccommodationRequest } from "@/modules/accommodation/dto/request/CreateAccommodationRequest";
import type { UpdateAccommodationRequest } from "@/modules/accommodation/dto/request/UpdateAccommodationRequest";
import type { UpdateAddressRequest } from "@/modules/accommodation/dto/request/UpdateAddressRequest";
import type { UpdateFacilitiesRequest } from "@/modules/accommodation/dto/request/UpdateFacilitiesRequest";
import type { UpdatePricingSettingsRequest } from "@/modules/accommodation/dto/request/UpdatePricingSettingsRequest";
import type { SearchAccommodationRequest } from "@/modules/accommodation/dto/request/SearchAccommodationRequest";
import { NotFoundError } from "@/shared/error/NotFoundError";
import { BadRequestError } from "@/shared/error/BadRequestError";
import { CACHE_SERVICE } from "@/infrastructure/infrastructure.tokens";
import type { ICacheService } from "@/infrastructure/cache/ICacheService";
import { IMAGE_SERVICE, EEntityType } from "@/modules/image";
import type { IImageService, ImageResponse } from "@/modules/image";
import { ROOM_SERVICE } from "@/modules/room";
import type { IRoomService, RoomResponse, RoomFilterOptions } from "@/modules/room";
import type { DynamicPricingSettings } from "@/modules/accommodation/domain/DynamicPricingSettings";

const CACHE_PREFIX = "acc:detail:";
const CACHE_TTL_SECONDS = 86400;
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;

@injectable()
export class AccommodationServiceImpl implements IAccommodationService {
	constructor(
		@inject(ACCOMMODATION_REPOSITORY) private readonly repository: IAccommodationRepository,
		@inject(CACHE_SERVICE) private readonly cache: ICacheService,
		@inject(IMAGE_SERVICE) private readonly imageService: IImageService,
		@inject(ROOM_SERVICE) private readonly roomService: IRoomService,
		private readonly mapper: AccommodationDtoMapper,
		private readonly codec: AccommodationCacheCodec
	) {}

	// --- Reads ---

	public async getById(id: string): Promise<AccommodationResponse> {
		const results = await this.getBatch([id]);
		if (results.length === 0) throw new NotFoundError(`Accommodation with ID ${id} not found`);
		const detail = results[0];
		// Single-detail reads also embed the rooms (search/batch omit them for payload size).
		detail.rooms = await this.loadRooms(id);
		return detail;
	}

	public async getAccommodationByRoomId(roomId: string): Promise<AccommodationResponse> {
		const accommodationId = await this.repository.findAccommodationIdByRoomId(roomId);
		if (!accommodationId) throw new NotFoundError(`Room with ID ${roomId} not found`);
		return this.getById(accommodationId);
	}

	public async getBatch(ids: string[]): Promise<AccommodationResponse[]> {
		return this.aggregateBatch(ids);
	}

	public async search(query: SearchAccommodationRequest): Promise<AccommodationSearchResponse> {
		const page = query.page ?? DEFAULT_PAGE;
		const limit = query.limit ?? DEFAULT_LIMIT;
		const offset = (page - 1) * limit;

		// 1. Pre-filter accommodation ids by room-level price/capacity (delegated to the room module).
		const filteredIds = await this.resolveRoomFilteredIds(query);
		if (filteredIds !== undefined && filteredIds.length === 0) {
			return this.emptySearch(page, limit);
		}

		const filters: SearchFilters = {
			keyword: query.keyword,
			type: query.type,
			ids: filteredIds,
			facilities: query.facilities,
		};

		// 2. Paginated stats rows (raw SQL) + total count.
		const { statsRows, total } = await this.repository.getStatsRows(filters, offset, limit, query.sortBy ?? ESortOption.NEWEST);
		if (total === 0 || statsRows.length === 0) {
			return this.emptySearch(page, limit);
		}

		// 3. Aggregate the page, reusing the stats rows we already have (no second stats query).
		const paginatedIds = statsRows.map((row) => row.id);
		const data = await this.aggregateBatch(paginatedIds, statsRows);

		return {
			data,
			meta: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
		};
	}

	public async getHomepageStats(): Promise<HomepageStatsResponse> {
		const [byType, byCity] = await Promise.all([this.repository.countByType(), this.repository.countByCity()]);
		return {
			types: byType.map((item) => ({ type: item.type, count: item.count })),
			cities: byCity.map((item) => ({ city: item.city, count: item.count })),
		};
	}

	public async getCount(city?: string, type?: EAccommodationType): Promise<AccommodationCountResponse> {
		const count = await this.repository.count({ city, type });
		return { city: city ?? null, type: type ?? null, count };
	}

	// --- Mutations (owner-scoped; all bust the detail cache and return the refreshed detail) ---

	public async create(ownerId: string, request: CreateAccommodationRequest): Promise<AccommodationResponse> {
		// Tri-state dynamicPricingSettings: undefined → inherit owner defaults, null → opt out, value → use.
		let resolvedSettings: DynamicPricingSettings | null;
		if (request.dynamicPricingSettings === undefined) {
			resolvedSettings = await this.repository.findOwnerDefaultSettings(ownerId);
		} else {
			resolvedSettings = (request.dynamicPricingSettings as DynamicPricingSettings | null) ?? null;
		}

		// Tri-state holiday opt-ins: undefined → snapshot owner rows, null → none, array → explicit.
		const holidayMode: HolidayMode = request.holidayOptIns === undefined ? "inherit" : request.holidayOptIns === null ? "none" : "explicit";
		const explicitHolidays: HolidayOptInData[] = holidayMode === "explicit" ? this.toHolidayData(request.holidayOptIns ?? []) : [];

		const newId = await this.repository.create({
			ownerId,
			name: request.name,
			description: request.description ?? null,
			type: request.type,
			rentalType: request.rentalType,
			dynamicPricingSettings: resolvedSettings,
			holidayMode,
			holidayOptIns: explicitHolidays,
		});

		return this.getById(newId);
	}

	public async updateBasicInfo(ownerId: string, id: string, request: UpdateAccommodationRequest): Promise<AccommodationResponse> {
		await this.assertOwnership(id, ownerId);
		await this.repository.updateBasicInfo(id, { name: request.name, description: request.description, type: request.type });
		await this.bustCache(id);
		return this.getById(id);
	}

	public async updateAddress(ownerId: string, id: string, request: UpdateAddressRequest): Promise<AccommodationResponse> {
		await this.assertOwnership(id, ownerId);
		await this.repository.updateAddress(id, {
			street: request.street,
			city: request.city,
			country: request.country,
			countryCode: request.countryCode,
			postalCode: request.postalCode,
			latitude: request.latitude,
			longitude: request.longitude,
			fullAddress: request.fullAddress,
			placeId: request.placeId,
		});
		await this.bustCache(id);
		return this.getById(id);
	}

	public async updateFacilities(ownerId: string, id: string, request: UpdateFacilitiesRequest): Promise<AccommodationResponse> {
		await this.assertOwnership(id, ownerId);
		await this.repository.syncFacilities(
			id,
			request.facilities.map((f) => ({ facilityId: f.facilityId, fee: f.fee, note: f.note, isAvailable: f.isAvailable }))
		);
		await this.bustCache(id);
		return this.getById(id);
	}

	public async updateStatus(ownerId: string, id: string, status: EAccommodationStatus): Promise<AccommodationResponse> {
		await this.assertOwnership(id, ownerId);
		await this.repository.updateStatus(id, status);
		await this.bustCache(id);
		return this.getById(id);
	}

	public async updatePricingSettings(ownerId: string, id: string, request: UpdatePricingSettingsRequest): Promise<AccommodationResponse> {
		await this.assertOwnership(id, ownerId);
		if (request.dynamicPricingSettings === undefined && request.holidayOptIns === undefined) {
			throw new BadRequestError("At least one of dynamicPricingSettings or holidayOptIns must be provided");
		}

		if (request.dynamicPricingSettings !== undefined) {
			await this.repository.updatePricingSettings(id, (request.dynamicPricingSettings as DynamicPricingSettings | null) ?? null);
		}
		if (request.holidayOptIns !== undefined) {
			// null clears them; an array replaces them. NOTE: the owner-level GLOBAL sync of
			// these opt-ins is owned by the pricing module and is not duplicated here.
			await this.repository.replaceHolidayOptIns(id, request.holidayOptIns === null ? [] : this.toHolidayData(request.holidayOptIns));
		}

		await this.bustCache(id);
		return this.getById(id);
	}

	public async publish(ownerId: string, id: string): Promise<AccommodationResponse> {
		const snapshot = await this.repository.getPublishSnapshot(id, ownerId);
		if (!snapshot) throw new NotFoundError("Accommodation not found or unauthorized");
		if (snapshot.status === EAccommodationStatus.PUBLISHED) {
			throw new BadRequestError("This accommodation is already published");
		}

		// Publish-readiness rules (mirror the monolith): address + ≥1 room, each room with a
		// positive base price, floorPrice ≤ basePrice, positive quantity, and ≥1 bed.
		if (!snapshot.hasAddress) {
			throw new BadRequestError("Cannot publish: Missing address information.");
		}
		if (snapshot.rooms.length === 0) {
			throw new BadRequestError("Cannot publish: You must add at least one room.");
		}
		for (const room of snapshot.rooms) {
			if (!room.basePrice || room.basePrice <= 0) {
				throw new BadRequestError(`Cannot publish: Room '${room.name}' must have a valid base price greater than 0.`);
			}
			if (room.floorPrice > room.basePrice) {
				throw new BadRequestError(`Cannot publish: Room '${room.name}' floor price must be ≤ base price.`);
			}
			if (!room.quantity || room.quantity <= 0) {
				throw new BadRequestError(`Cannot publish: Room '${room.name}' must have a valid quantity.`);
			}
			if (room.bedCount === 0) {
				throw new BadRequestError(`Cannot publish: Room '${room.name}' must have at least one bed.`);
			}
		}

		await this.repository.updateStatus(id, EAccommodationStatus.PUBLISHED);
		await this.bustCache(id);

		// NOTE: deferred — the monolith also enqueues a Pinecone re-index job here
		// (semantic search). That belongs to a search/indexing module (not built).
		return this.getById(id);
	}

	// --- Aggregation + caching ---

	/**
	 * Aggregate base accommodations (read-through `acc:detail:` cache) with images
	 * and stats. Returns one response per requested id (skipping ids not found).
	 */
	private async aggregateBatch(ids: string[], preFetchedStats?: AccommodationStatsRow[]): Promise<AccommodationResponse[]> {
		if (ids.length === 0) return [];

		const baseMap = await this.loadBaseAccommodations(ids);

		const statsRows = preFetchedStats ?? (await this.repository.getStatsRows({ ids }, 0, ids.length)).statsRows;
		const statsMap = new Map(statsRows.map((row) => [row.id, row]));

		const imagesMap = await this.loadImages(ids);

		const responses: AccommodationResponse[] = [];
		for (const id of ids) {
			const accommodation = baseMap.get(id);
			if (!accommodation) continue;
			responses.push(
				this.mapper.toResponse(accommodation, {
					images: imagesMap[id] ?? [],
					stats: statsMap.get(id),
				})
			);
		}
		return responses;
	}

	/** Resolve base accommodations from the cache, loading DB misses and back-filling the cache. */
	private async loadBaseAccommodations(ids: string[]): Promise<Map<string, Accommodation>> {
		const result = new Map<string, Accommodation>();
		if (ids.length === 0) return result;

		const cached = await this.readBaseFromCache(ids);
		cached.forEach((acc, id) => result.set(id, acc));

		const missingIds = ids.filter((id) => !result.has(id));
		if (missingIds.length > 0) {
			const dbRows = await this.repository.findByIdBatch(missingIds);
			await this.writeBaseToCache(dbRows);
			for (const acc of dbRows) result.set(acc.id, acc);
		}
		return result;
	}

	private async readBaseFromCache(ids: string[]): Promise<Map<string, Accommodation>> {
		const map = new Map<string, Accommodation>();
		await Promise.all(
			ids.map(async (id) => {
				try {
					const raw = await this.cache.get(`${CACHE_PREFIX}${id}`);
					if (!raw) return;
					const acc = this.codec.decode(raw);
					if (acc) map.set(acc.id, acc);
				} catch (err) {
					console.error(`[AccommodationService] cache get ${id} failed`, err);
				}
			})
		);
		return map;
	}

	private async writeBaseToCache(accommodations: Accommodation[]): Promise<void> {
		await Promise.all(
			accommodations.map(async (acc) => {
				try {
					await this.cache.set(`${CACHE_PREFIX}${acc.id}`, this.codec.encode(acc), CACHE_TTL_SECONDS);
				} catch (err) {
					console.error(`[AccommodationService] cache set ${acc.id} failed`, err);
				}
			})
		);
	}

	private async bustCache(id: string): Promise<void> {
		try {
			await this.cache.del(`${CACHE_PREFIX}${id}`);
		} catch (err) {
			console.error(`[AccommodationService] cache del ${id} failed`, err);
		}
	}

	// --- Cross-module helpers (best-effort: a dependency hiccup must not fail the read) ---

	private async loadImages(ids: string[]): Promise<Record<string, ImageResponse[]>> {
		try {
			return await this.imageService.getImagesByEntities(EEntityType.ACCOMMODATION, ids);
		} catch (err) {
			console.error("[AccommodationService] batch image load failed", err);
			return {};
		}
	}

	private async loadRooms(accommodationId: string): Promise<RoomResponse[]> {
		try {
			return await this.roomService.getRoomsByAccommodationId(accommodationId);
		} catch (err) {
			console.error(`[AccommodationService] loading rooms for ${accommodationId} failed`, err);
			return [];
		}
	}

	/** If room-level filters (price/capacity/room-sort) are present, ask the room module for matching ids. */
	private async resolveRoomFilteredIds(query: SearchAccommodationRequest): Promise<string[] | undefined> {
		const needsRoomSort =
			query.sortBy === ESortOption.PRICE_ASC ||
			query.sortBy === ESortOption.PRICE_DESC ||
			query.sortBy === ESortOption.NAME_ASC ||
			query.sortBy === ESortOption.NAME_DESC ||
			query.sortBy === ESortOption.RECOMMENDED;

		if (query.minPrice === undefined && query.maxPrice === undefined && !query.adults && !query.children && !needsRoomSort) {
			return undefined;
		}

		const requiredRooms = query.rooms && query.rooms > 0 ? query.rooms : 1;
		const totalAdults = query.adults ?? 0;
		const totalChildren = query.children ?? 0;
		const adultsPerRoom = totalAdults > 0 ? Math.ceil(totalAdults / requiredRooms) : undefined;
		const childrenPerRoom = totalChildren > 0 ? Math.ceil(totalChildren / requiredRooms) : undefined;

		const filters: RoomFilterOptions = {
			minPrice: query.minPrice,
			maxPrice: query.maxPrice,
			adults: adultsPerRoom,
			children: childrenPerRoom,
			sortBy: query.sortBy,
		};
		return this.roomService.filterAccommodationIds(filters);
	}

	private async assertOwnership(id: string, ownerId: string): Promise<void> {
		const isOwner = await this.repository.checkOwnership(id, ownerId);
		if (!isOwner) throw new BadRequestError("Accommodation not found or unauthorized");
	}

	private toHolidayData(items: { holidayCode: string; priceMultiplier: number; preDays: number; postDays: number; enabled?: boolean }[]): HolidayOptInData[] {
		return items.map((h) => ({
			holidayCode: h.holidayCode,
			priceMultiplier: h.priceMultiplier,
			preDays: h.preDays,
			postDays: h.postDays,
			enabled: h.enabled ?? true,
		}));
	}

	private emptySearch(page: number, limit: number): AccommodationSearchResponse {
		return { data: [], meta: { page, limit, total: 0, totalPages: 0 } };
	}
}
