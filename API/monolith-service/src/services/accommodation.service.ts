import AccommodationRepository from "@/repositories/accommodation.repository";
import { NotFoundError } from "../errors";
import { RoomService, ImageService } from "@/services"; //Double check path
import { type EAccommodationType } from "@/generated/client";
import { AccommodationEntity, SearchQuery, ServiceImageDto, ServiceRoomDto, SearchResultItem, ESortOption } from "@/types/accommodation.types";

const MAX_SEARCH_LOOPS = 3; // Max loops to find enough available accommodations
const AVAILABILITY_CHECK_BATCH_OVERHEAD = 10; // Fetch extra items to account for unavailable ones

class AccommodationService {
	readonly #accommodationRepository: AccommodationRepository;
	readonly #roomService: RoomService = new RoomService();
	readonly #imageService: ImageService = new ImageService();
	constructor(accommodationRepository: AccommodationRepository, roomService: RoomService, imageService: ImageService) {
		this.#accommodationRepository = accommodationRepository;
		this.#roomService = roomService;
		this.#imageService = imageService;
	}

	async getAccommodationById(id: string, startDate?: string, endDate?: string): Promise<AccommodationEntity> {
		// 1. Create 3 Promises to run in parallel
		const accommodationPromise = this.#accommodationRepository.findById(id);
		const roomsPromise = this.#roomService.getRoomsByAccommodationId(id, startDate, endDate) as Promise<ServiceRoomDto[]>;
		const imagesPromise = this.#imageService.getImagesForEntity(id) as Promise<ServiceImageDto[]>;

		// 2. Await all Promises
		const [accommodation, rooms, images] = await Promise.all([accommodationPromise, roomsPromise, imagesPromise]);

		// 3. Check if accommodation exists
		if (!accommodation) {
			throw new NotFoundError(`Accommodation with ID ${id} not found`);
		}

		// 4. Combine data and return
		return {
			...accommodation,
			rooms: rooms,
			images: images,
		};
	}

	/**
	 * Gets Accommodation details by a Room ID.
	 */
	async getAccommodationByRoomId(roomId: string): Promise<AccommodationEntity> {
		console.log(`[AccommodationService] Finding accommodation for room ID: ${roomId}`);

		const accommodationId = await this.#roomService.getAccommodationIdByRoomId(roomId);
		console.log(`[AccommodationService] Found accommodation ID: ${accommodationId} for room ID: ${roomId}`);

		return this.getAccommodationById(accommodationId);
	}

	async getHomepageStats() {
		console.log("[AccommodationService] Fetching homepage stats...");

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
		data: SearchResultItem[];
		meta: {
			page: number;
			limit: number;
			total: number;
			totalPages: number;
		};
	}> {
		const pageNum = Number(query.page || "1");
		const limitNum = Number(query.limit || "20");

		// Step 1: Get initial list of candidate IDs from Room service if needed.
		const filteredIds = await this._getInitialFilteredIds(query);

		// If filtering by room properties returns no candidates, we can stop early.
		if (filteredIds?.length === 0) {
			return {
				data: [],
				meta: { page: pageNum, limit: limitNum, total: 0, totalPages: 0 },
			};
		}

		// Step 2: Find accommodations matching the criteria and check availability.
		const { availableAccommodations, totalMatchesInDB } = await this._findAndCheckAvailability(query, filteredIds, pageNum, limitNum);

		// Step 3: Enrich the results with images and final pricing.
		const enrichedResults = await this._enrichAccommodationsWithDetails(availableAccommodations, query.checkIn, query.checkOut);

		// Step 4: Sort the final list.
		const sortedResults = this._sortResults(enrichedResults, query.sortBy);

		// Step 5: Return the paginated response.
		return {
			data: sortedResults,
			meta: {
				page: pageNum,
				limit: limitNum,
				total: totalMatchesInDB,
				totalPages: Math.ceil(totalMatchesInDB / limitNum) || 1,
			},
		};
	}

	// =================================================================
	// PRIVATE HELPER METHODS FOR SEARCH
	// =================================================================

	/**
	 * Step 1: If room-related filters are present, call Room service to get a pre-filtered list of accommodation IDs.
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

		console.log("[AccommodationService] Getting pre-filtered IDs from RoomService...");
		const result = await this.#roomService.getFilteredAccommodationIds(minPrice ? Number(minPrice) : undefined, maxPrice ? Number(maxPrice) : undefined, adultsPerRoom, childrenPerRoom, sortBy);
		return result || undefined;
	}

	/**
	 * Step 2: Loop through batched search results from the repository and check for availability if dates are provided.
	 */
	private async _findAndCheckAvailability(query: SearchQuery, filteredIds: string[] | undefined, pageNum: number, limitNum: number) {
		const { keyword, type, facilities, checkIn, checkOut, rooms, sortBy } = query;
		let totalMatchesInDB = 0;

		if (checkIn && checkOut) {
			// --- Path with Availability Check (more complex) ---
			const finalResults: AccommodationEntity[] = [];
			let currentOffset = (pageNum - 1) * limitNum;
			let hasMoreToCheck = true;
			let loopCount = 0;

			while (finalResults.length < limitNum && hasMoreToCheck && loopCount < MAX_SEARCH_LOOPS) {
				loopCount++;
				const batchLimit = limitNum - finalResults.length + AVAILABILITY_CHECK_BATCH_OVERHEAD;

				const searchResult = await this.#accommodationRepository.search(
					{ keyword, type, ids: filteredIds, facilities: facilities ? (Array.isArray(facilities) ? facilities : [facilities]) : undefined },
					currentOffset,
					batchLimit
				);

				const candidates: AccommodationEntity[] = searchResult.data as AccommodationEntity[];
				totalMatchesInDB = searchResult.total;

				if (candidates.length === 0) {
					hasMoreToCheck = false;
					break;
				}

				const requiredRooms = rooms ? Number(rooms) : 1;
				const availableCandidates = await this._filterForAvailability(candidates, checkIn, checkOut, requiredRooms);

				finalResults.push(...availableCandidates);
				currentOffset += candidates.length;

				if (currentOffset >= totalMatchesInDB) {
					hasMoreToCheck = false;
				}
			}
			return { availableAccommodations: finalResults.slice(0, limitNum), totalMatchesInDB };
		} else {
			// --- Path without Availability Check (simpler) ---
			const offset = (pageNum - 1) * limitNum;
			const searchResult = await this.#accommodationRepository.search(
				{ keyword, type, ids: filteredIds, facilities: facilities ? (Array.isArray(facilities) ? facilities : [facilities]) : undefined },
				offset,
				limitNum,
				sortBy
			);
			totalMatchesInDB = searchResult.total;
			const availableAccommodations = searchResult.data as AccommodationEntity[];
			return { availableAccommodations, totalMatchesInDB };
		}
	}

	/**
	 * Helper for Step 2: Filters a batch of accommodations for room availability.
	 */
	private async _filterForAvailability(accommodations: AccommodationEntity[], checkIn: string, checkOut: string, requiredRooms: number): Promise<AccommodationEntity[]> {
		const availabilityPromises = accommodations.map(async (acc) => {
			try {
				const roomList = (await this.#roomService.getRoomsByAccommodationId(acc.id, checkIn, checkOut)) as ServiceRoomDto[];
				const isAvailable = roomList.some((r) => (r.remainingQuantity || 0) >= requiredRooms);

				if (isAvailable) {
					acc.rooms = roomList; // Attach rooms data to avoid re-fetching
					return acc;
				}
				return null;
			} catch (error) {
				console.error(`[AccommodationService] Failed to check availability for accomm ID ${acc.id}. Error:`, error);
				return null;
			}
		});

		const results = await Promise.all(availabilityPromises);
		return results.filter((r): r is AccommodationEntity => r !== null);
	}

	/**
	 * Step 3: Fetches images and calculates minimum price for a list of accommodations.
	 */
	private async _enrichAccommodationsWithDetails(accommodations: AccommodationEntity[], checkIn?: string, checkOut?: string): Promise<SearchResultItem[]> {
		const enrichedPromises = accommodations.map(async (acc) => {
			// Fetch images
			const imagesPromise = this.#imageService.getImagesForEntity(acc.id) as Promise<ServiceImageDto[]>;

			// Fetch rooms ONLY if they weren't fetched during availability check
			const roomsPromise = acc.rooms ? Promise.resolve(acc.rooms) : (this.#roomService.getRoomsByAccommodationId(acc.id, checkIn, checkOut) as Promise<ServiceRoomDto[]>);

			const [images, roomsData] = await Promise.all([imagesPromise, roomsPromise]);

			// Calculate thumbnail
			const thumbnail = images.length > 0 ? images[0].url : null;

			// Calculate minPrice
			let minPrice: number | null = null;
			if (roomsData && roomsData.length > 0) {
				const prices = roomsData.map((r) => Number(r.price)).filter((p) => p > 0);
				if (prices.length > 0) {
					minPrice = Math.min(...prices);
				}
			}

			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			const { rooms, ...rest } = acc; // Remove rooms from final object to keep payload light

			return {
				...rest,
				thumbnail,
				minPrice,
			};
		});

		return Promise.all(enrichedPromises);
	}

	/**
	 * Step 4: Sorts the final results based on the sortBy query parameter.
	 */
	private _sortResults(accommodations: SearchResultItem[], sortBy?: ESortOption): SearchResultItem[] {
		if (sortBy === ESortOption.PRICE_ASC || sortBy === ESortOption.RECOMMENDED) {
			// Using slice() to avoid mutating the original array
			return accommodations.slice().sort((a, b) => (a.minPrice || Infinity) - (b.minPrice || Infinity));
		}
		if (sortBy === ESortOption.PRICE_DESC) {
			return accommodations.slice().sort((a, b) => (b.minPrice || -Infinity) - (a.minPrice || -Infinity));
		}
		return accommodations;
	}
}

// Singleton instance
export default AccommodationService;
