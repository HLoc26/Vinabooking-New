import { PrismaClient, Prisma, type EAccommodationType } from "@/generated/client";
import { SearchFilters, AccommodationWithDetails, AccommodationSearchResult, ESortOption } from "@/types/accommodation.types";

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

	public async countByType(): Promise<{ type: EAccommodationType; _count: { id: number } }[]> {
		const result = await this.#prismaClient.accommodation.groupBy({
			by: ["type"] as const,
			where: { isActive: true },
			_count: { id: true },
			orderBy: { _count: { id: Prisma.SortOrder.desc } },
		});

		return result;
	}

	public async countByCity(): Promise<{ city: string; _count: { id: number } }[]> {
		const result = await this.#prismaClient.address.groupBy({
			by: ["city"] as const,
			where: { accommodation: { isActive: true } },
			_count: { id: true },
			orderBy: { _count: { id: Prisma.SortOrder.desc } },
			take: 20,
		});

		return result as unknown as { city: string; _count: { id: number } }[];
	}

	public async count(filters: { city?: string; type?: EAccommodationType }): Promise<number> {
		const where: Prisma.AccommodationWhereInput = { isActive: true };
		if (filters.type) where.type = filters.type;
		if (filters.city) where.address = { city: { contains: filters.city } };

		return await this.#prismaClient.accommodation.count({ where });
	}

	public async search(filters: SearchFilters, offset: number, limit: number, sortBy: ESortOption = ESortOption.NEWEST): Promise<AccommodationSearchResult> {
		const where: Prisma.AccommodationWhereInput = {
			isActive: true,
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
				return { data: [], total: 0 };
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

		// 5. Sort
		let orderBy: Prisma.AccommodationOrderByWithRelationInput = { createdAt: Prisma.SortOrder.desc };

		switch (sortBy) {
			case ESortOption.NAME_ASC:
				orderBy = { name: Prisma.SortOrder.asc };
				break;
			case ESortOption.NAME_DESC:
				orderBy = { name: Prisma.SortOrder.desc };
				break;
		}

		const [data, total] = await Promise.all([
			this.#prismaClient.accommodation.findMany({
				where,
				include: { address: true, facilities: { include: { facility: true } } },
				skip: offset,
				take: limit,
				orderBy,
			}),
			this.#prismaClient.accommodation.count({ where }),
		]);

		return { data, total };
	}
}

export default AccommodationRepository;
