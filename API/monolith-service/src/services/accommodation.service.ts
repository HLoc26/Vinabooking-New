import AccommodationRepository from "@/repositories/accommodation.repository";
import { NotFoundError } from "../errors";
import { RoomService, ImageService, S3Service } from "@/services"; //Double check path
import { EEntityType, type EAccommodationType } from "@/generated/client";
import { SearchQuery, ESortOption, AccommodationFullInfo, SearchFilters } from "@/types/accommodation.types";
import { ImageFullInfo } from "@/types/image.types";

class AccommodationService {
	readonly #accommodationRepository: AccommodationRepository;
	readonly #roomService: RoomService;
	readonly #imageService: ImageService;
	readonly #s3Service: S3Service;
	constructor(accommodationRepository: AccommodationRepository, roomService: RoomService, imageService: ImageService, s3Service: S3Service) {
		this.#accommodationRepository = accommodationRepository;
		this.#roomService = roomService;
		this.#imageService = imageService;
		this.#s3Service = s3Service;
	}

	async getAccommodationById(id: string): Promise<AccommodationFullInfo> {
		// 1. Create 3 Promises to run in parallel
		const accommodationPromise = this.#accommodationRepository.findById(id);
		const imagesPromise = this.#imageService.getImage(EEntityType.ACCOMMODATION, id);

		// 2. Await all Promises
		const [accommodation, images] = await Promise.all([accommodationPromise, imagesPromise]);

		// 3. Check if accommodation exists
		if (!accommodation) {
			throw new NotFoundError(`Accommodation with ID ${id} not found`);
		}

		// 4. Combine data and return
		return {
			...accommodation,
			images: images,
			// Overwriting the nested Prisma structure with the flattened one
			facilities: accommodation.facilities
				.filter((f) => f.isAvailable)
				.map((f) => ({
					id: f.id,
					name: f.facility.name,
					type: f.facility.type,
					description: f.facility.description,
					fee: f.fee,
					note: f.note,
				})),
		} as unknown as AccommodationFullInfo;
	}

	/**
	 * Gets Accommodation details by a Room ID.
	 */
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

	/**
	 * SEARCH API (Full Flow)
	 */
	async searchAccommodations(query: SearchQuery): Promise<{
		data: AccommodationFullInfo[];
		meta: {
			page: number;
			limit: number;
			total: number;
			totalPages: number;
		};
	}> {
		const pageNum = Number(query.page || "1");
		const limitNum = Number(query.limit || "20");
		const offset = (pageNum - 1) * limitNum;

		// Get availables from room service
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

		// Search, calculate minPrice, reviews, pagination, sort in repository
		const { data, total } = await this.#accommodationRepository.search(searchFilters, offset, limitNum, query.sortBy);

		if (data.length === 0) {
			return { data: [], meta: { page: pageNum, limit: limitNum, total: 0, totalPages: 0 } };
		}

		// Get all images from accomms in 1 query
		const accIds = data.map((acc) => acc.id);
		const imagesBatch = await this.#imageService.getImagesBatch(EEntityType.ACCOMMODATION, accIds);

		const imageMap: Record<string, ImageFullInfo[]> = {};
		imagesBatch.forEach((img) => {
			const roomId = img.references[0].entityId;
			if (!imageMap[roomId]) imageMap[roomId] = [];
			imageMap[roomId].push(img);
		});

		// Merge data and format facilities
		const finalData = data.map((acc) => {
			const accImages = imageMap[acc.id] || [];
			const thumbnail = accImages.length > 0 ? this.#s3Service.getS3Url(accImages[0].s3Key) : null;

			return {
				...acc,
				thumbnail,
				images: accImages,
				facilities: acc.facilities.map((f) => ({
					id: f.id,
					name: f.facility.name,
					type: f.facility.type,
					description: f.facility.description,
					fee: f.fee,
					note: f.note,
				})),
			} as unknown as AccommodationFullInfo;
		});

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
}

export default AccommodationService;
