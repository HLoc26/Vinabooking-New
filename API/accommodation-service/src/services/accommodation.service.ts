import { accommodationRepository } from "../repositories/accommodation.repository";
import { NotFoundError } from "../errors";
import { roomClient } from "../clients/room.client";
import { imageClient } from "../clients/image.client";
import { EAccommodationType } from "@prisma/client";
import type { SearchQuery } from "../types/Search";
import type { AccommodationFromRepository, AccommodationSearchResultItem } from "../types/accommodation";

export class AccommodationService {
	async getAccommodationById(id: string, startDate?: string, endDate?: string) {
		console.log(`[AccommodationService] Fetching details for accomm ID: ${id}`);

		// 1. Create 3 Promises to run in parallel
		const accommodationPromise = accommodationRepository.findById(id);
		const roomsPromise = roomClient.getRoomsByAccommodationId(id, startDate, endDate);
		const imagesPromise = imageClient.getImagesForEntity(id);

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
	async getAccommodationByRoomId(roomId: string) {
		console.log(`[AccommodationService] Finding accommodation for room ID: ${roomId}`);
		// 1. Call Room Service Client to get the Accommodation ID
		const accommodationId = await roomClient.getAccommodationIdByRoomId(roomId);
		console.log(`[AccommodationService] Found accommodation ID: ${accommodationId} for room ID: ${roomId}`);

		// 2. Use the existing getAccommodationById to fetch details (which includes fetching rooms again)
		const accommodationDetails = await this.getAccommodationById(accommodationId);

		return accommodationDetails;
	}

	/**
	 * Gets homepage statistics: popular accommodation types and cities.
	 */
	async getHomepageStats() {
		console.log("[AccommodationService] Fetching homepage stats...");

		const [byType, byCity] = await Promise.all([accommodationRepository.countByType(), accommodationRepository.countByCity()]);

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

	/**
	 * Counts accommodations based on optional city and type filters.
	 */
	async getCount(city?: string, type?: string) {
		const count = await accommodationRepository.count({
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
	async searchAccommodations(query: SearchQuery) {
		const { keyword, type, checkIn, checkOut, adults, children, rooms, minPrice, maxPrice, facilities, page = "1", limit = "20", sortBy } = query;

		const limitNum = Number(limit);
		const pageNum = Number(page);
		const requiredRooms = rooms ? Number(rooms) : 1;

		// --- BƯỚC 1: Lọc ID theo Giá & Người ---
		let filteredIds: string[] | undefined = undefined;
		const needsRoomSort = sortBy === "price_asc" || sortBy === "price_desc" || sortBy === "recommended";
		if (minPrice || maxPrice || adults || children || needsRoomSort) {
			const result = await roomClient.getFilteredAccommodationIds(
				minPrice ? Number(minPrice) : undefined,
				maxPrice ? Number(maxPrice) : undefined,
				adults ? Number(adults) : undefined,
				children ? Number(children) : undefined,
				sortBy
			);

			// Nếu lọc mà không tìm thấy ID nào -> Trả về rỗng ngay
			if (!result || result.length === 0) {
				return {
					data: [],
					meta: { page: pageNum, limit: limitNum, total: 0, totalPages: 0 },
				};
			}
			filteredIds = result;
		}

		// --- BƯỚC 2: Loop Search & Check Availability ---
		const finalResults: AccommodationFromRepository[] = [];
		let currentOffset = (pageNum - 1) * limitNum;
		let hasMoreToCheck = true;
		let loopCount = 0;
		const needsAvailabilityCheck = checkIn && checkOut;
		let totalMatchesInDB = 0;

		while (finalResults.length < limitNum && hasMoreToCheck && loopCount < 3) {
			loopCount++;
			const batchLimit = limitNum + 10; // Lấy dư để bù

			const searchResult = await accommodationRepository.search(
				{
					keyword: keyword,
					type: type as EAccommodationType,
					ids: filteredIds,
					facilities: facilities ? (Array.isArray(facilities) ? facilities : [facilities]) : undefined,
				},
				currentOffset,
				batchLimit,
				sortBy
			);

			const candidates: AccommodationFromRepository[] = searchResult.data as AccommodationFromRepository[];
			totalMatchesInDB = searchResult.total;

			if (candidates.length === 0) {
				hasMoreToCheck = false;
				break;
			}

			if (needsAvailabilityCheck) {
				const checkPromises = candidates.map(async (acc) => {
					try {
						const roomList = await roomClient.getRoomsByAccommodationId(acc.id, checkIn, checkOut);

						// Check xem có loại phòng nào còn đủ số lượng (requiredRooms) không
						const isAvailable = roomList.some((r: any) => {
							const remaining = r.remainingQuantity || 0;
							return remaining >= requiredRooms;
						});

						if (isAvailable) return acc;
						return null;
					} catch (e) {
						return null;
					}
				});

				const results = await Promise.all(checkPromises);
				const validResults = results.filter((r): r is AccommodationFromRepository => r !== null);

				finalResults.push(...validResults);
			} else {
				finalResults.push(...candidates);
			}

			currentOffset += candidates.length;
			if (candidates.length < batchLimit) hasMoreToCheck = false;
		}

		// --- BƯỚC 3: Format & Lấy ảnh ---
		const slicedResults = finalResults.slice(0, limitNum);

		const formattedData: AccommodationSearchResultItem[] = await Promise.all(
			slicedResults.map(async (acc) => {
				// 1. Lấy ảnh và phòng song song
				const imagesPromise = imageClient.getImagesForEntity(acc.id);
				const roomsPromise = roomClient.getRoomsByAccommodationId(acc.id);

				const [images, rooms] = await Promise.all([imagesPromise, roomsPromise]);

				// 2. Xử lý ảnh -> thumbnail
				const firstImage = images.length > 0 ? (images[0] as any) : null;
				const thumbnail = firstImage ? firstImage.url || firstImage.s3Key : null;

				// 3. Xử lý giá -> minPrice
				let minPrice = 0;
				if (rooms && rooms.length > 0) {
					const prices = rooms.map((r: any) => Number(r.price));
					minPrice = Math.min(...prices);
				}

				// 4. Xử lý facilities -> string[]
				const facilityNames = acc.facilities ? acc.facilities.map((f) => f.facility.name) : [];

				// 5. Loại bỏ các trường không cần thiết khỏi object cuối
				const { facilities, ownerId, isActive, ...restOfAcc } = acc;

				return {
					...restOfAcc,
					facilities: facilityNames,
					thumbnail,
					minPrice,
				};
			})
		);

		// --- BƯỚC 4: Sắp xếp lại kết quả cuối cùng (Client-side Sort) ---
		if (sortBy === "price_asc" || sortBy === "recommended") {
			formattedData.sort((a, b) => a.minPrice - b.minPrice);
		} else if (sortBy === "price_desc") {
			formattedData.sort((a, b) => b.minPrice - a.minPrice);
		}

		return {
			data: formattedData,
			meta: {
				page: pageNum,
				limit: limitNum,
				total: totalMatchesInDB,
				totalPages: Math.ceil(totalMatchesInDB / limitNum) || 1,
			},
		};
	}
}

// Singleton instance
export const accommodationService = new AccommodationService();
