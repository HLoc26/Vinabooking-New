import { PrismaClient, Prisma, Room, Bed } from "@/generated/client";
import type { RoomFilterOptions, RoomWithDetails, AmenityConfigWithDetails } from "@/types/room.types";

class RoomRepository {
	readonly #prismaClient: PrismaClient;

	constructor(prismaClient: PrismaClient) {
		this.#prismaClient = prismaClient;
	}

	/**
	 * (R) Tìm một Room bằng ID.
	 * Bao gồm cả Beds và Amenities chi tiết.
	 */
	public async findById(roomId: string): Promise<RoomWithDetails | null> {
		return await this.#prismaClient.room.findUnique({
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
	 * (R) Tìm NHIỀU Rooms bằng danh sách IDs.
	 * Bao gồm cả Beds và Amenities chi tiết.
	 */

	public async findManyByIds(ids: string[]) {
		if (!ids || ids.length === 0) {
			return [];
		}
		return this.#prismaClient.room.findMany({
			where: {
				id: {
					in: ids,
				},
			},
			include: {
				beds: true,
				amenities: true,
			},
		});
	}

	/**
	 * (R) Tìm TẤT CẢ Rooms thuộc một Accommodation.
	 */
	public async findAllByAccommodationId(accommodationId: string): Promise<RoomWithDetails[]> {
		return await this.#prismaClient.room.findMany({
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
	 */
	public async create(data: Prisma.RoomCreateArgs["data"]): Promise<RoomWithDetails> {
		return await this.#prismaClient.room.create({
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
	public async update(roomId: string, data: Prisma.RoomUpdateInput): Promise<RoomWithDetails> {
		return await this.#prismaClient.room.update({
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
	public async delete(roomId: string): Promise<Room> {
		return await this.#prismaClient.room.delete({
			where: { id: roomId },
		});
	}

	// --- Quản lý Bed ---

	/**
	 * (C) Thêm một Bed vào Room.
	 */
	public async addBed(roomId: string, bedData: Prisma.BedCreateWithoutRoomInput): Promise<Bed> {
		return await this.#prismaClient.bed.create({
			data: {
				...bedData,
				roomId: roomId,
			},
		});
	}

	/**
	 * (U) Cập nhật một Bed.
	 */
	public async updateBed(bedId: string, bedData: Prisma.BedUpdateInput): Promise<Bed> {
		return await this.#prismaClient.bed.update({
			where: { id: bedId },
			data: bedData,
		});
	}

	/**
	 * (D) Xóa một Bed.
	 */
	public async removeBed(bedId: string): Promise<Bed> {
		return await this.#prismaClient.bed.delete({
			where: { id: bedId },
		});
	}

	// --- Quản lý AmenityConfig ---

	/**
	 * (C) Thêm một Amenity vào Room (tạo AmenityConfig).
	 */
	public async addAmenity(roomId: string, amenityId: string, data: { note?: string | null }): Promise<AmenityConfigWithDetails> {
		return await this.#prismaClient.amenityConfig.create({
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
	public async removeAmenity(roomId: string, amenityId: string): Promise<Prisma.BatchPayload> {
		return await this.#prismaClient.amenityConfig.deleteMany({
			where: {
				roomId: roomId,
				amenityId: amenityId,
			},
		});
		// Note: Dùng deleteMany an toàn hơn delete khi dùng composite key phức tạp
	}

	/**
	 * (R) Tìm danh sách Accommodation IDs theo bộ lọc: Giá & Số người.
	 * Logic: Lấy hết phòng thỏa điều kiện -> Group by Accommodation -> Sort -> Return IDs
	 */
	public async findAccommodationIdsByFilter(filters: RoomFilterOptions): Promise<string[]> {
		const where: Prisma.RoomWhereInput = {
			isActive: true,
		};

		// 1. Lọc theo Giá
		if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
			where.price = {};
			if (filters.minPrice !== undefined) where.price.gte = filters.minPrice;
			if (filters.maxPrice !== undefined) where.price.lte = filters.maxPrice;
		}

		// 2. Lọc theo Sức chứa
		if (filters.adults) {
			where.maxAdults = {
				gte: filters.adults,
			};
		}

		// 3. Lấy dữ liệu để xử lý Group và Sort
		const rooms = await this.#prismaClient.room.findMany({
			where,
			select: {
				accommodationId: true,
				price: true,
			},
		});

		// 4. Group by accommodationId và tìm minPrice
		const accMap = new Map<string, number>();

		rooms.forEach((room) => {
			const currentMin = accMap.get(room.accommodationId) || Infinity;
			// Ép kiểu Number vì Prisma Decimal trả về object hoặc string tùy config
			const roomPrice = Number(room.price);

			if (roomPrice < currentMin) {
				accMap.set(room.accommodationId, roomPrice);
			}
		});

		// Chuyển Map thành mảng các object { id, price } để sort
		const sortedAccs = Array.from(accMap.entries()).map(([id, price]) => ({
			id,
			price,
		}));

		// 5. Xử lý Sắp xếp (Sort)
		const sortBy = filters.sortBy;

		if (sortBy === "price_asc" || sortBy === "recommended") {
			sortedAccs.sort((a, b) => a.price - b.price);
		} else if (sortBy === "price_desc") {
			sortedAccs.sort((a, b) => b.price - a.price);
		}

		// 6. Trả về danh sách ID đã được sắp xếp
		return sortedAccs.map((item) => item.id);
	}
}

export default RoomRepository;
