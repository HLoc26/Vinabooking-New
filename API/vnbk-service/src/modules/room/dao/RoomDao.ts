import { injectable } from "tsyringe";
import { Prisma } from "@/generated/client";
import { PrismaProvider } from "@/infrastructure/persistence/PrismaProvider";
import { BaseDao } from "@/infrastructure/persistence/BaseDao";
import type { IRoomRepository, RoomFilterOptions } from "@/modules/room/repository/IRoomRepository";
import type { Room } from "@/modules/room/domain/Room";
import type { CreateRoomRequest } from "@/modules/room/dto/request/CreateRoomRequest";
import type { CreateBedRequest } from "@/modules/room/dto/request/CreateBedRequest";
import type { UpdateRoomRequest } from "@/modules/room/dto/request/UpdateRoomRequest";
import type { UpdateBedRequest } from "@/modules/room/dto/request/UpdateBedRequest";
import { RoomEntityMapper } from "@/modules/room/dao/mapper/RoomEntityMapper";

/** The full include shape used when loading a room graph (beds + amenity configs). */
const ROOM_DETAIL_INCLUDE = {
	beds: true,
	amenities: { include: { amenity: true } },
} as const;

/** Prisma-backed implementation of IRoomRepository. The only place Room touches Prisma. */
@injectable()
export class RoomDao extends BaseDao implements IRoomRepository {
	constructor(
		private readonly prisma: PrismaProvider,
		private readonly mapper: RoomEntityMapper
	) {
		super();
	}

	public async findById(roomId: string): Promise<Room | null> {
		return this.run(async () => {
			const entity = await this.prisma.client.room.findUnique({
				where: { id: roomId },
				include: ROOM_DETAIL_INCLUDE,
			});
			return entity ? this.mapper.toDomain(entity) : null;
		});
	}

	public async findManyByIds(ids: string[]): Promise<Room[]> {
		return this.run(async () => {
			if (!ids || ids.length === 0) return [];
			const entities = await this.prisma.client.room.findMany({
				where: { id: { in: ids } },
				include: ROOM_DETAIL_INCLUDE,
			});
			return entities.map((e) => this.mapper.toDomain(e));
		});
	}

	public async findAllByAccommodationId(accommodationId: string): Promise<Room[]> {
		return this.run(async () => {
			const entities = await this.prisma.client.room.findMany({
				where: { accommodationId },
				include: ROOM_DETAIL_INCLUDE,
				orderBy: { createdAt: "asc" },
			});
			return entities.map((e) => this.mapper.toDomain(e));
		});
	}

	public async findAccommodationIdsByFilter(filters: RoomFilterOptions): Promise<string[]> {
		return this.run(async () => {
			const where: Prisma.RoomWhereInput = { isActive: true };

			// Filter by base price (fast path — no check-in needed).
			if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
				const basePrice: Prisma.DecimalFilter = {};
				if (filters.minPrice !== undefined) basePrice.gte = filters.minPrice;
				if (filters.maxPrice !== undefined) basePrice.lte = filters.maxPrice;
				where.basePrice = basePrice;
			}

			// Filter by capacity.
			if (filters.adults) {
				where.maxAdults = { gte: filters.adults };
			}

			const rooms = await this.prisma.client.room.findMany({
				where,
				select: { accommodationId: true, basePrice: true },
			});

			// Group by accommodation, keeping the minimum room price.
			const accMap = new Map<string, number>();
			for (const room of rooms) {
				const currentMin = accMap.get(room.accommodationId) ?? Infinity;
				const roomPrice = Number(room.basePrice);
				if (roomPrice < currentMin) accMap.set(room.accommodationId, roomPrice);
			}

			const sortedAccs = Array.from(accMap.entries()).map(([id, price]) => ({ id, price }));

			const sortBy = filters.sortBy;
			if (sortBy === "price_asc" || sortBy === "recommended") {
				sortedAccs.sort((a, b) => a.price - b.price);
			} else if (sortBy === "price_desc") {
				sortedAccs.sort((a, b) => b.price - a.price);
			}

			return sortedAccs.map((item) => item.id);
		});
	}

	public async create(accommodationId: string, data: CreateRoomRequest): Promise<Room> {
		return this.run(async () => {
			const entity = await this.prisma.client.room.create({
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
					basePrice: data.basePrice ?? 0,
					floorPrice: data.floorPrice ?? data.basePrice ?? 0,
					pricingType: data.pricingType,
					isActive: data.isActive ?? true,
					beds: {
						create: (data.beds ?? []).map((bed) => this.toBedCreateData(bed)),
					},
					amenities: {
						create: (data.amenityIds ?? []).map((id) => ({ amenityId: id })),
					},
				},
				include: ROOM_DETAIL_INCLUDE,
			});
			return this.mapper.toDomain(entity);
		});
	}

	public async update(roomId: string, data: UpdateRoomRequest): Promise<Room> {
		return this.run(async () => {
			const entity = await this.prisma.client.$transaction(async (tx) => {
				// Diff incoming beds against the DB to decide create/update/delete.
				const currentBeds = await tx.bed.findMany({ where: { roomId }, select: { id: true } });
				const currentIdsInDb = currentBeds.map((b) => b.id);

				const incomingBeds = data.beds ?? [];
				const bedsToUpdate = incomingBeds.filter((b) => b.id && currentIdsInDb.includes(b.id));
				const bedsToCreate = incomingBeds.filter((b) => !b.id);
				const incomingIds = incomingBeds.map((b) => b.id).filter((id): id is string => !!id);
				const idsToDelete = currentIdsInDb.filter((id) => !incomingIds.includes(id));

				return tx.room.update({
					where: { id: roomId },
					data: {
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
						basePrice: data.basePrice !== undefined ? String(data.basePrice) : undefined,
						floorPrice: data.floorPrice !== undefined ? String(data.floorPrice) : undefined,
						pricingType: data.pricingType ?? undefined,
						isActive: data.isActive ?? undefined,
						beds: {
							deleteMany: { id: { in: idsToDelete } },
							update: bedsToUpdate.map((b) => ({
								where: { id: b.id },
								data: this.toBedUpdateData(b),
							})),
							create: bedsToCreate.map((b) => this.toBedCreateData(b)),
						},
						// Sync amenity configs only when amenityIds was supplied.
						amenities: data.amenityIds
							? {
									deleteMany: { amenityId: { notIn: data.amenityIds } },
									upsert: data.amenityIds.map((id) => ({
										where: { roomId_amenityId: { roomId, amenityId: id } },
										update: {},
										create: { amenityId: id },
									})),
								}
							: undefined,
					},
					include: ROOM_DETAIL_INCLUDE,
				});
			});
			return this.mapper.toDomain(entity);
		});
	}

	public async delete(roomId: string): Promise<void> {
		return this.run(async () => {
			await this.prisma.client.room.delete({ where: { id: roomId } });
		});
	}

	public async checkAccommodationOwnership(accommodationId: string, ownerId: string): Promise<boolean> {
		return this.run(async () => {
			const count = await this.prisma.client.accommodation.count({
				where: { id: accommodationId, ownerId },
			});
			return count > 0;
		});
	}

	public async checkRoomOwnership(roomId: string, ownerId: string): Promise<boolean> {
		return this.run(async () => {
			const count = await this.prisma.client.room.count({
				where: { id: roomId, accommodation: { ownerId } },
			});
			return count > 0;
		});
	}

	// --- Bed mapping helpers (BUNK_BED normalization mirrors the monolith) ---

	/** True if the raw bed type is a bunk bed (legacy "BUNK" alias included). */
	private isBunk(bedType: string | undefined): boolean {
		const raw = String(bedType ?? "").toUpperCase();
		return raw === "BUNK" || raw === "BUNK_BED" || raw.includes("BUNK");
	}

	private toBedCreateData(bed: CreateBedRequest | UpdateBedRequest): Prisma.BedCreateWithoutRoomInput {
		const bunk = this.isBunk(bed.bedType);
		return {
			// On create-from-update, name/price may be absent — default like the monolith.
			name: bed.name || "New Bed",
			bedType: bunk ? "BUNK_BED" : (bed.bedType ?? "OTHER"),
			description: bed.description,
			size: bed.size,
			price: bed.price ?? 0,
			// A bunk bed counts as two beds.
			quantity: bunk ? (bed.quantity ?? 1) * 2 : (bed.quantity ?? 1),
		};
	}

	private toBedUpdateData(bed: UpdateBedRequest): Prisma.BedUpdateWithoutRoomInput {
		const bunk = this.isBunk(bed.bedType);
		return {
			name: bed.name ?? undefined,
			bedType: bed.bedType ? (bunk ? "BUNK_BED" : bed.bedType) : undefined,
			description: bed.description ?? undefined,
			size: bed.size ?? undefined,
			price: bed.price !== undefined ? Number(bed.price) : undefined,
			quantity: bunk ? (bed.quantity ?? 1) * 2 : (bed.quantity ?? 1),
		};
	}
}
