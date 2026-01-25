import { PrismaClient, type Prisma, type EAccommodationType } from "@generated/client";
import type { SearchFilters } from "../types/accommodation.types";

class AccommodationRepository {
	readonly #prismaClient: PrismaClient;

	constructor(prismaClient: PrismaClient) {
		this.#prismaClient = prismaClient;
	}

	public async findById(id: string) {
		return await this.#prismaClient.accommodation.findUnique({
			where: { id },
			include: {
				address: true,
				facilities: { include: { facility: true } },
			},
		});
	}

	public async countByType() {
		return await this.#prismaClient.accommodation.groupBy({
			by: ["type"],
			where: { isActive: true },
			_count: { id: true },
			orderBy: { _count: { id: "desc" } },
		});
	}

	public async countByCity() {
		return await this.#prismaClient.address.groupBy({
			by: ["city"],
			where: { accommodation: { isActive: true } },
			_count: { id: true },
			orderBy: { _count: { id: "desc" } },
			take: 20,
		});
	}

	public async count(filters: { city?: string; type?: EAccommodationType }) {
		const where: Prisma.AccommodationWhereInput = { isActive: true };
		if (filters.type) where.type = filters.type;
		if (filters.city) where.address = { city: { contains: filters.city } };

		return await this.#prismaClient.accommodation.count({ where });
	}

	public async search(filters: SearchFilters, offset: number, limit: number, sortBy: string = "newest") {
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
		let orderBy: Prisma.AccommodationOrderByWithRelationInput = { createdAt: "desc" };
		if (sortBy === "name_asc") orderBy = { name: "asc" };
		else if (sortBy === "name_desc") orderBy = { name: "desc" };

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
