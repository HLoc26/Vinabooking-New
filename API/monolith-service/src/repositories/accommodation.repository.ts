import { PrismaClient, Prisma, type EAccommodationType, type EAccommodationStatus } from "@/generated/client";
import { SearchFilters, AccommodationWithDetails, ESortOption, UpdateAccommodationDTO, UpdateAddressDTO } from "@/types/accommodation.types";

class AccommodationRepository {
	readonly #prismaClient: PrismaClient;

	constructor(prismaClient: PrismaClient) {
		this.#prismaClient = prismaClient;
	}

	public async findById(id: string): Promise<AccommodationWithDetails | null> {
		return await this.#prismaClient.accommodation.findUnique({
			where: { id },
			include: {
				address: true,
				facilities: { include: { facility: true } },
			},
		});
	}

	public async findByIdBatch(ids: string[]): Promise<AccommodationWithDetails[]> {
		const accommodation = await this.#prismaClient.accommodation.findMany({
			where: { id: { in: ids } },
			include: { address: true, facilities: { include: { facility: true } } },
		});
		return accommodation;
	}

	public async countByType(): Promise<{ type: EAccommodationType; _count: { id: number } }[]> {
		const result = await this.#prismaClient.accommodation.groupBy({
			by: ["type"] as const,
			where: { status: "PUBLISHED" },
			_count: { id: true },
			orderBy: { _count: { id: Prisma.SortOrder.desc } },
		});

		return result;
	}

	public async countByCity(): Promise<{ city: string; _count: { id: number } }[]> {
		const result = await this.#prismaClient.address.groupBy({
			by: ["city"] as const,
			where: { accommodation: { status: "PUBLISHED" } },
			_count: { id: true },
			orderBy: { _count: { id: Prisma.SortOrder.desc } },
			take: 20,
		});

		return result as unknown as { city: string; _count: { id: number } }[];
	}

	public async count(filters: { city?: string; type?: EAccommodationType }): Promise<number> {
		const where: Prisma.AccommodationWhereInput = { status: "PUBLISHED" };
		if (filters.type) where.type = filters.type;
		if (filters.city) where.address = { city: { contains: filters.city } };

		return await this.#prismaClient.accommodation.count({ where });
	}

	public async getStatsRows(filters: SearchFilters, offset: number, limit: number, sortBy: ESortOption = ESortOption.NEWEST) {
		const where: Prisma.AccommodationWhereInput = {
			status: "PUBLISHED",
		};

		// 1. Keyword
		if (filters.keyword) {
			where.OR = [{ name: { contains: filters.keyword } }, { address: { city: { contains: filters.keyword } } }, { address: { fullAddress: { contains: filters.keyword } } }];
		}

		// 2. Type
		if (filters.type) {
			where.type = filters.type;
		}

		// 3. IDs
		if (filters.ids !== undefined) {
			if (filters.ids.length === 0) {
				return { paginatedIds: [], statsRows: [], total: 0 };
			}
			where.id = { in: filters.ids };
		}

		// 4. Facilities
		if (filters.facilities && filters.facilities.length > 0) {
			where.AND = filters.facilities.map((facilityName) => ({
				facilities: {
					some: {
						facility: {
							name: facilityName,
						},
					},
				},
			}));
		}

		// Get all IDs that matches
		const matchingRecords = await this.#prismaClient.accommodation.findMany({
			where,
			select: { id: true },
		});
		const matchedIds = matchingRecords.map((r) => r.id);
		const totalMatches = matchedIds.length; // <-- Đếm tổng số lượng record thỏa mãn

		if (totalMatches === 0) {
			return { paginatedIds: [], statsRows: [], total: 0 };
		}
		// TODO: Add minPrice, avgStar, and reviewCount column for faster query
		// Use raw SQL
		let orderClause = Prisma.sql`ORDER BY a.createdAt DESC`;
		if (sortBy === ESortOption.RECOMMENDED) orderClause = Prisma.sql`ORDER BY minPrice IS NULL, avgStar IS NULL, minPrice ASC, avgStar DESC`;
		if (sortBy === ESortOption.PRICE_ASC) orderClause = Prisma.sql`ORDER BY minPrice IS NULL, minPrice ASC`;
		if (sortBy === ESortOption.PRICE_DESC) orderClause = Prisma.sql`ORDER BY minPrice IS NULL, minPrice DESC`;
		if (sortBy === ESortOption.NAME_ASC) orderClause = Prisma.sql`ORDER BY a.name ASC`;
		if (sortBy === ESortOption.NAME_DESC) orderClause = Prisma.sql`ORDER BY a.name DESC`;
		if (sortBy === ESortOption.RATING) orderClause = Prisma.sql`ORDER BY avgStar IS NULL, avgStar DESC`;

		// TODO: unify table names in prisma.schema
		const roomTable = "rooms";
		const accommodationTable = "accommodations";
		const reviewTable = "Review";
		const bedTable = "beds";
		const statsRows = await this.#prismaClient.$queryRaw<{ id: string; minPrice: number | null; avgStar: number | null; reviewCount: number }[]>`
            SELECT 
                a.id,
                a.name,
                a.createdAt,
                (
                    SELECT MIN(
                        COALESCE(
                            CAST(NULLIF(r.price, '') AS DECIMAL(10,2)),
                            (SELECT MIN(CAST(b.price AS DECIMAL(10,2))) FROM ${Prisma.raw(bedTable)} b WHERE b.roomId = r.id)
                        )
                    )
					FROM ${Prisma.raw(roomTable)} r
                    WHERE r.accommodationId = a.id
                ) AS minPrice,
                (
                    SELECT AVG(rev.star) FROM ${Prisma.raw(reviewTable)} rev WHERE rev.accommodationId = a.id
                ) AS avgStar,
                (
                    SELECT COUNT(rev.id) FROM ${Prisma.raw(reviewTable)} rev WHERE rev.accommodationId = a.id
                ) AS reviewCount
			FROM ${Prisma.raw(accommodationTable)} a
            WHERE a.id IN (${Prisma.join(matchedIds)})
            ${orderClause}
            LIMIT ${limit} OFFSET ${offset}
        `;

		return { statsRows, total: totalMatches };
	}

	public async getByOwnerId(ownerId: string): Promise<AccommodationWithDetails[]> {
		return await this.#prismaClient.accommodation.findMany({
			where: { ownerId },
			include: {
				address: true,
				_count: { select: { rooms: true, reviews: true } },
				facilities: { include: { facility: true } },
			},
			orderBy: { createdAt: Prisma.SortOrder.desc },
		});
	}

	public async create(data: Prisma.AccommodationCreateInput): Promise<AccommodationWithDetails> {
		return await this.#prismaClient.accommodation.create({
			data,
			include: {
				address: true,
				facilities: { include: { facility: true } },
			},
		});
	}

	public async checkOwnership(id: string, ownerId: string): Promise<boolean> {
		const count = await this.#prismaClient.accommodation.count({
			where: { id, ownerId },
		});
		return count > 0;
	}

	public async syncFacilities(accommodationId: string, facilities: { facilityId: string; fee?: number; note?: string; isAvailable?: boolean }[]) {
		// Dùng Transaction để xóa cũ, thêm mới an toàn
		return await this.#prismaClient.$transaction(async (tx) => {
			await tx.facilityConfig.deleteMany({ where: { accommodationId } });

			if (facilities && facilities.length > 0) {
				await tx.facilityConfig.createMany({
					data: facilities.map((f) => ({
						accommodationId,
						facilityId: f.facilityId,
						fee: f.fee || 0,
						note: f.note,
						isAvailable: f.isAvailable ?? true,
					})),
				});
			}
		});
	}

	public async updateBasicInfo(id: string, data: UpdateAccommodationDTO) {
		return await this.#prismaClient.accommodation.update({
			where: { id },
			data: {
				name: data.name,
				description: data.description,
				type: data.type,
				rentalType: data.rentalType,
			},
		});
	}

	public async updateStatus(id: string, status: EAccommodationStatus) {
		return await this.#prismaClient.accommodation.update({
			where: { id },
			data: { status },
		});
	}

	public async updateAddress(accommodationId: string, data: UpdateAddressDTO) {
		return await this.#prismaClient.accommodation.update({
			where: { id: accommodationId },
			data: {
				address: {
					upsert: {
						create: data,
						update: data,
					},
				},
			},
		});
	}
}

export default AccommodationRepository;
