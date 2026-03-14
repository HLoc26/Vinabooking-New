import { PrismaClient, Prisma, Room, Bed } from "@/generated/client";
import type { RoomFilterOptions, RoomWithDetails, AmenityConfigWithDetails, CreateRoomDTO, UpdateRoomDTO, CreateBedDTO, UpdateBedDTO } from "@/types/room.types";

class RoomRepository {
	readonly #prismaClient: PrismaClient;

	constructor(prismaClient: PrismaClient) {
		this.#prismaClient = prismaClient;
	}

	// ==========================================
	// 0 - SECURITY CHECKPOINT (tránh lỗi IDOR)
	// ==========================================

	// 1. Kiểm tra xem Accommodation có phải của Owner không (Dùng khi tạo phòng mới)
	public async checkAccommodationOwnership(accommodationId: string, ownerId: string): Promise<boolean> {
		const count = await this.#prismaClient.accommodation.count({
			where: { id: accommodationId, ownerId: ownerId },
		});
		return count > 0;
	}

	// 2. Room -> Accommodation -> Owner (Dùng khi Sửa/Xóa phòng, Thêm tiện ích/giường)
	public async checkRoomOwnership(roomId: string, ownerId: string): Promise<boolean> {
		const count = await this.#prismaClient.room.count({
			where: {
				id: roomId,
				accommodation: { ownerId: ownerId },
			},
		});
		return count > 0;
	}

	// 3. Bed -> Room -> Accommodation -> Owner (Dùng khi Sửa/Xóa giường)
	public async checkBedOwnership(bedId: string, ownerId: string): Promise<boolean> {
		const count = await this.#prismaClient.bed.count({
			where: {
				id: bedId,
				room: { accommodation: { ownerId: ownerId } },
			},
		});
		return count > 0;
	}

	// ==========================================
	// 1 - ROOM CRUD
	// ==========================================

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
		if (!ids || ids.length === 0) return [];

		return this.#prismaClient.room.findMany({
			where: { id: { in: ids } },
			include: {
				beds: true,
				amenities: {
					include: {
						amenity: {
							select: {
								id: true,
								name: true,
								type: true,
								description: true,
							},
						},
					},
				},
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

	public async create(accommodationId: string, data: CreateRoomDTO): Promise<RoomWithDetails> {
		return await this.#prismaClient.room.create({
			data: {
				accommodationId,
				name: data.name,
				description: data.description,
				quantity: data.quantity,
				maxAdults: data.maxAdults,
				maxChildren: data.maxChildren,
				size: data.size,
				bedroomCount: data.bedroomCount,
				bathroomCount: data.bathroomCount,
				viewType: data.viewType,
				viewDescription: data.viewDescription,
				price: data.price,
				pricingType: data.pricingType,
				isActive: data.isActive ?? true,
			},
			include: {
				beds: true,
				amenities: { include: { amenity: true } },
			},
		});
	}

	public async update(roomId: string, data: UpdateRoomDTO): Promise<RoomWithDetails> {
		return await this.#prismaClient.room.update({
			where: { id: roomId },
			data: data,
			include: {
				beds: true,
				amenities: { include: { amenity: true } },
			},
		});
	}

	public async delete(roomId: string): Promise<Room> {
		return await this.#prismaClient.room.delete({
			where: { id: roomId },
		});
	}

	// ==========================================
	// 2 - BED CRUD
	// ==========================================

	public async addBed(roomId: string, data: CreateBedDTO): Promise<Bed> {
		return await this.#prismaClient.bed.create({
			data: {
				roomId: roomId,
				name: data.name,
				description: data.description,
				bedType: data.bedType,
				size: data.size,
				price: data.price,
				isActive: data.isActive ?? true,
			},
		});
	}

	public async updateBed(bedId: string, data: UpdateBedDTO): Promise<Bed> {
		return await this.#prismaClient.bed.update({
			where: { id: bedId },
			data: data,
		});
	}

	public async removeBed(bedId: string): Promise<Bed> {
		return await this.#prismaClient.bed.delete({
			where: { id: bedId },
		});
	}

	// ==========================================
	// 3 - AMENITY CONFIG
	// ==========================================

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

	public async removeAmenity(roomId: string, amenityId: string): Promise<Prisma.BatchPayload> {
		return await this.#prismaClient.amenityConfig.deleteMany({
			where: {
				roomId: roomId,
				amenityId: amenityId,
			},
		});
	}
}

export default RoomRepository;
