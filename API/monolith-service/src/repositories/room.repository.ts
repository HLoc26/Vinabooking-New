import { PrismaClient, Prisma } from "@/generated/client";
import type { RoomFilterOptions } from "@/types/room.types";
import { Room } from "@/models/room/room.model";
import { RoomMapper } from "@/mappers/room.mapper";

class RoomRepository {
	readonly #prismaClient: PrismaClient;

	constructor(prismaClient: PrismaClient) {
		this.#prismaClient = prismaClient;
	}

	// ==========================================
	// 1 - ROOM CRUD
	// ==========================================

	/**
	 * (R) Tìm một Room bằng ID.
	 * Bao gồm cả Beds và Amenities chi tiết.
	 */
	public async findById(roomId: string): Promise<Room | null> {
		const entity = await this.#prismaClient.room.findUnique({
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
		return entity ? RoomMapper.toDomain(entity as any) : null;
	}

	/**
	 * (R) Tìm NHIỀU Rooms bằng danh sách IDs.
	 * Bao gồm cả Beds và Amenities chi tiết.
	 */
	public async findManyByIds(ids: string[]): Promise<Room[]> {
		if (!ids || ids.length === 0) return [];

		const entities = await this.#prismaClient.room.findMany({
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
		return entities.map(e => RoomMapper.toDomain(e as any));
	}

	public async findBedsByIds(ids: string[]) {
		if (!ids || ids.length === 0) return [];

		return this.#prismaClient.bed.findMany({
			where: { id: { in: ids } },
		});
	}

	/**
	 * (R) Tìm TẤT CẢ Rooms thuộc một Accommodation.
	 */
	public async findAllByAccommodationId(accommodationId: string): Promise<Room[]> {
		const entities = await this.#prismaClient.room.findMany({
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
		return entities.map(e => RoomMapper.toDomain(e as any));
	}

	/**
	 * (R) Tìm danh sách Accommodation IDs theo bộ lọc: Giá & Số người.
	 * Mặc dù trả về aggregate ids, đây là phương thức Read-Model truy vấn tối ưu.
	 */
	public async findAccommodationIdsByFilter(filters: RoomFilterOptions): Promise<string[]> {
		const where: Prisma.RoomWhereInput = {
			isActive: true,
		};

		if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
			where.basePrice = {};
			if (filters.minPrice !== undefined) where.basePrice.gte = filters.minPrice;
			if (filters.maxPrice !== undefined) where.basePrice.lte = filters.maxPrice;
		}

		if (filters.adults) {
			where.maxAdults = {
				gte: filters.adults,
			};
		}

		const rooms = await this.#prismaClient.room.findMany({
			where,
			select: {
				accommodationId: true,
				basePrice: true,
			},
		});

		const accMap = new Map<string, number>();

		rooms.forEach((room) => {
			const currentMin = accMap.get(room.accommodationId) || Infinity;
			const roomPrice = Number(room.basePrice);

			if (roomPrice < currentMin) {
				accMap.set(room.accommodationId, roomPrice);
			}
		});

		const sortedAccs = Array.from(accMap.entries()).map(([id, price]) => ({
			id,
			price,
		}));

		const sortBy = filters.sortBy;

		if (sortBy === "price_asc" || sortBy === "recommended") {
			sortedAccs.sort((a, b) => a.price - b.price);
		} else if (sortBy === "price_desc") {
			sortedAccs.sort((a, b) => b.price - a.price);
		}

		return sortedAccs.map((item) => item.id);
	}

	/**
	 * Save domain Room aggregate to persistence.
	 */
	public async save(room: Room): Promise<void> {
		const data = RoomMapper.toPersistenceCreate(room);

		await this.#prismaClient.$transaction(async (tx) => {
			const existing = await tx.room.findUnique({
				where: { id: room.getId() },
				select: { id: true }
			});

			if (!existing) {
				// CREATE
				await tx.room.create({
					data: data as Prisma.RoomCreateInput,
				});
			} else {
				// UPDATE
				await tx.room.update({
					where: { id: room.getId() },
					data: {
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
						basePrice: data.basePrice,
						floorPrice: data.floorPrice,
						pricingType: data.pricingType,
						isActive: data.isActive,
					}
				});

				// UPDATE BEDS
				// We overwrite beds by clearing all and recreating them inside transaction to ensure purity.
				// This guarantees the aggregate matches persistence exactly.
				await tx.bed.deleteMany({ where: { roomId: room.getId() } });
				if (data.beds?.create && (data.beds.create as any[]).length > 0) {
					await tx.bed.createMany({
						data: (data.beds.create as any[]).map(bed => ({
							...bed,
							roomId: room.getId()
						}))
					});
				}

				// UPDATE AMENITIES
				await tx.amenityConfig.deleteMany({ where: { roomId: room.getId() } });
				if (data.amenities?.create && (data.amenities.create as any[]).length > 0) {
					await tx.amenityConfig.createMany({
						data: (data.amenities.create as any[]).map(amen => ({
							...amen,
							roomId: room.getId()
						}))
					});
				}
			}
		});
	}

	/**
	 * Bulk update floor prices for all rooms in an accommodation.
	 */
	public async bulkUpdateFloorPrices(accommodationId: string, rule: { percent: number; minAmount: number }) {
		const rooms = await this.#prismaClient.room.findMany({
			where: { accommodationId },
			select: { id: true, basePrice: true },
		});

		return await this.#prismaClient.$transaction(async (tx) => {
			for (const room of rooms) {
				const base = Number(room.basePrice);
				const calculated = Math.max(base * (rule.percent / 100), rule.minAmount);
				const finalFloor = Math.min(calculated, base);

				await tx.room.update({
					where: { id: room.id },
					data: { floorPrice: new Prisma.Decimal(finalFloor) },
				});
			}
			return { updatedCount: rooms.length };
		});
	}

	public async delete(roomId: string): Promise<void> {
		await this.#prismaClient.room.delete({
			where: { id: roomId },
		});
	}
}

export default RoomRepository;
