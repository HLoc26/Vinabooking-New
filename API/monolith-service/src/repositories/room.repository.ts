import { PrismaClient, Prisma, Room } from "@/generated/client";
import type { RoomFilterOptions, RoomWithDetails, CreateRoomDTO, UpdateRoomDTO } from "@/types/room.types";

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

	// 2. Room -> Accommodation -> Owner (Dùng khi Sửa/Xóa phòng)
	public async checkRoomOwnership(roomId: string, ownerId: string): Promise<boolean> {
		const count = await this.#prismaClient.room.count({
			where: {
				id: roomId,
				accommodation: { ownerId: ownerId },
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
				beds: {
					create:
						data.beds?.map((bed) => {
							// 1. Kiểm tra nếu giá trị là BUNK thì chuyển thành BUNK_BED để khớp với Schema
							const rawType = String(bed.bedType).toUpperCase();
							const isBunk = rawType === "BUNK" || rawType === "BUNK_BED";
							const finalBedType = isBunk ? "BUNK_BED" : bed.bedType;

							return {
								name: bed.name,
								bedType: finalBedType,
								description: bed.description,
								size: bed.size,
								price: bed.price,
								// 2. Logic: Nếu là giường tầng thì lưu quantity gấp đôi (x2)
								quantity: isBunk ? (bed.quantity ?? 1) * 2 : (bed.quantity ?? 1),
							};
						}) || [],
				},
				amenities: {
					create: data.amenityIds?.map((id) => ({ amenityId: id })) || [],
				},
			},
			include: {
				beds: true,
				amenities: { include: { amenity: true } },
			},
		});
	}

	public async updateRoomAtCreate(roomId: string, data: UpdateRoomDTO): Promise<RoomWithDetails> {
		return await this.#prismaClient.$transaction(async (tx) => {
			// 1. Lấy trạng thái hiện tại của Beds trong DB để so sánh
			const currentBeds = await tx.bed.findMany({
				where: { roomId },
				select: { id: true },
			});
			const currentIdsInDb = currentBeds.map((b) => b.id);

			const incomingBeds = data.beds || [];

			// 2. Phân loại hành động cho Bed
			const bedsToUpdate = incomingBeds.filter((b) => b.id && currentIdsInDb.includes(b.id));
			const bedsToCreate = incomingBeds.filter((b) => !b.id);
			const incomingIds = incomingBeds.map((b) => b.id).filter((id): id is string => !!id);
			const idsToDelete = currentIdsInDb.filter((id) => !incomingIds.includes(id));

			// 3. Helper xử lý data Bed (Dùng undefined để giữ data cũ nếu không truyền)
			const mapBedData = (bed: any) => {
				const rawType = String(bed.bedType).toUpperCase();
				const isBunk = rawType.includes("BUNK");
				const quantity = isBunk ? (bed.quantity ?? 1) * 2 : (bed.quantity ?? 1);

				return {
					name: bed.name ?? undefined,
					bedType: (isBunk ? "BUNK_BED" : bed.bedType) as any,
					description: bed.description ?? undefined,
					size: bed.size ?? undefined,
					price: bed.price !== undefined ? Number(bed.price) : undefined,
					quantity: quantity,
				};
			};

			// 4. Thực thi Update tổng thể
			const result = await tx.room.update({
				where: { id: roomId },
				data: {
					// Map đầy đủ các trường của Room từ data
					name: data.name ?? undefined,
					description: data.description ?? undefined,
					quantity: data.quantity ?? undefined,
					maxAdults: data.maxAdults ?? undefined,
					maxChildren: data.maxChildren ?? undefined,
					size: data.size ?? undefined,
					bedroomCount: data.bedroomCount ?? undefined,
					bathroomCount: data.bathroomCount ?? undefined,
					viewType: data.viewType ?? undefined,
					viewDescription: data.viewDescription ?? undefined,
					price: data.price !== undefined ? String(data.price) : undefined, // Nếu DB dùng kiểu String/Decimal
					pricingType: data.pricingType ?? undefined,
					isActive: data.isActive ?? undefined,

					// Xử lý quan hệ Beds
					beds: {
						deleteMany: { id: { in: idsToDelete } },
						update: bedsToUpdate.map((b) => ({
							where: { id: b.id },
							data: mapBedData(b),
						})),
						create: bedsToCreate.map((b) => ({
							...mapBedData(b),
							name: b.name || "New Bed",
							price: b.price || 0,
						})),
					},

					// Xử lý quan hệ Amenities (Dùng Upsert để đồng bộ)
					amenities: data.amenityIds
						? {
								deleteMany: {
									amenityId: { notIn: data.amenityIds },
								},
								upsert: data.amenityIds.map((id) => ({
									where: { roomId_amenityId: { roomId, amenityId: id } },
									update: {}, // Không đổi gì ở bảng trung gian nếu đã tồn tại
									create: { amenityId: id },
								})),
							}
						: undefined,
				},
				include: {
					beds: true,
					amenities: {
						include: { amenity: true },
					},
				},
			});

			return result as RoomWithDetails;
		});
	}

	public async delete(roomId: string): Promise<Room> {
		return await this.#prismaClient.room.delete({
			where: { id: roomId },
		});
	}
}

export default RoomRepository;
