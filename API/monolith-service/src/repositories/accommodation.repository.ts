import { PrismaClient, Prisma, type EAccommodationType, type EAccommodationStatus } from "@/generated/client";
import { SearchFilters, AccommodationWithDetails, ESortOption, UpdateAccommodationDTO, UpdateAddressDTO, CreateAccommodationDTO, UpdatePolicyDTO } from "@/types/accommodation.types";
import type { DynamicPricingSettings } from "@/types/pricing.types";

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
				policy: true,
				facilities: { include: { facility: true } },
			},
		});
	}

	public async findByIdBatch(ids: string[]): Promise<AccommodationWithDetails[]> {
		const accommodation = await this.#prismaClient.accommodation.findMany({
			where: { id: { in: ids } },
			include: { address: true, policy: true, facilities: { include: { facility: true } } },
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

		// 5. Policy Filters
		const policyWhere: Prisma.AccommodationPolicyWhereInput = {};
		let hasPolicyFilter = false;

		if (filters.allowsPets !== undefined && filters.allowsPets !== "undefined") {
			policyWhere.allowsPets = filters.allowsPets === "true";
			hasPolicyFilter = true;
		}
		if (filters.allowsSmoking !== undefined && filters.allowsSmoking !== "undefined") {
			policyWhere.allowsSmoking = filters.allowsSmoking === "true";
			hasPolicyFilter = true;
		}
		if (filters.allowsParties !== undefined && filters.allowsParties !== "undefined") {
			policyWhere.allowsParties = filters.allowsParties === "true";
			hasPolicyFilter = true;
		}
		if (filters.checkInTime && filters.checkInTime !== "ANY" && filters.checkInTime !== "undefined") {
			policyWhere.checkInTime = { lte: filters.checkInTime };
			hasPolicyFilter = true;
		}
		if (filters.checkOutTime && filters.checkOutTime !== "ANY" && filters.checkOutTime !== "undefined") {
			policyWhere.checkOutTime = { gte: filters.checkOutTime };
			hasPolicyFilter = true;
		}
		if (filters.quietHoursStart && filters.quietHoursStart !== "ANY" && filters.quietHoursStart !== "undefined") {
			policyWhere.quietHoursStart = { gte: filters.quietHoursStart };
			hasPolicyFilter = true;
		}
		if (filters.cancellationPolicy && filters.cancellationPolicy !== "ANY" && filters.cancellationPolicy !== "undefined") {
			policyWhere.cancellationPolicy = filters.cancellationPolicy as any;
			hasPolicyFilter = true;
		}
		if (filters.prepaymentPolicy && filters.prepaymentPolicy !== "ANY" && filters.prepaymentPolicy !== "undefined") {
			policyWhere.prepaymentPolicy = filters.prepaymentPolicy as any;
			hasPolicyFilter = true;
		}

		if (hasPolicyFilter) {
			where.policy = policyWhere;
		}

		// Get all IDs that matches
		const matchingRecords = await this.#prismaClient.accommodation.findMany({
			where,
			select: { id: true },
		});
		const matchedIds = matchingRecords.map((r) => r.id);
		const totalMatches = matchedIds.length;

		if (totalMatches === 0) {
			return { paginatedIds: [], statsRows: [], total: 0 };
		}

		let orderClause = Prisma.sql`ORDER BY a.createdAt DESC`;
		if (sortBy === ESortOption.RECOMMENDED) orderClause = Prisma.sql`ORDER BY minPrice IS NULL, avgStar IS NULL, minPrice ASC, avgStar DESC`;
		if (sortBy === ESortOption.PRICE_ASC) orderClause = Prisma.sql`ORDER BY minPrice IS NULL, minPrice ASC`;
		if (sortBy === ESortOption.PRICE_DESC) orderClause = Prisma.sql`ORDER BY minPrice IS NULL, minPrice DESC`;
		if (sortBy === ESortOption.NAME_ASC) orderClause = Prisma.sql`ORDER BY a.name ASC`;
		if (sortBy === ESortOption.NAME_DESC) orderClause = Prisma.sql`ORDER BY a.name DESC`;
		if (sortBy === ESortOption.RATING) orderClause = Prisma.sql`ORDER BY avgStar IS NULL, avgStar DESC`;

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
							CAST(NULLIF(r.base_price, '') AS DECIMAL(10,2)),
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
				policy: true,
				_count: { select: { rooms: true, reviews: true } },
				facilities: { include: { facility: true } },
			},
			orderBy: { createdAt: Prisma.SortOrder.desc },
		});
	}

	public async findDraftByOwnerId(ownerId: string): Promise<AccommodationWithDetails[]> {
		return await this.#prismaClient.accommodation.findMany({
			where: { ownerId, status: "DRAFT" },
			include: {
				address: true,
				policy: true,
				facilities: { include: { facility: true } },
				rooms: true,
			},
			orderBy: { createdAt: Prisma.SortOrder.desc },
		});
	}

	public async getDashboardCardsByOwnerId(ownerId: string) {
		return await this.#prismaClient.accommodation.findMany({
			where: { ownerId },
			select: {
				id: true,
				name: true,
				type: true,
				status: true,
				updatedAt: true,
				address: {
					select: {
						fullAddress: true,
					},
				},
				_count: {
					select: {
						rooms: true,
						reviews: true,
					},
				},
				reviews: {
					select: {
						star: true,
					},
				},
			},
			orderBy: { updatedAt: Prisma.SortOrder.desc },
		});
	}

	public async create(ownerId: string, data: CreateAccommodationDTO): Promise<AccommodationWithDetails> {
		return await this.#prismaClient.accommodation.create({
			data: {
				name: data.name,
				description: data.description,
				type: data.type,
				rentalType: data.rentalType,
				status: "DRAFT",
				owner: {
					connect: { id: ownerId },
				},
			},
			include: {
				address: true,
				policy: true,
				facilities: { include: { facility: true } },
			},
		});
	}

	public async updatePricingSettings(id: string, settings: DynamicPricingSettings | null) {
		const value = settings === null ? Prisma.JsonNull : (settings as Prisma.InputJsonValue);
		return await this.#prismaClient.accommodation.update({
			where: { id },
			data: { dynamicPricingSettings: value },
			select: { id: true, dynamicPricingSettings: true },
		});
	}

	public async findAllByOwnerId(ownerId: string) {
		return await this.#prismaClient.accommodation.findMany({
			where: { ownerId },
			select: { id: true },
		});
	}

	public async syncAllWithGlobalSettings(
		ownerId: string,
		settings: DynamicPricingSettings | null,
		holidays: { holidayCode: string; priceMultiplier: number; preDays: number; postDays: number; enabled: boolean }[]
	) {
		const accommodations = await this.findAllByOwnerId(ownerId);
		const accIds = accommodations.map((a) => a.id);

		if (accIds.length === 0) return { updatedCount: 0 };

		const settingsValue = settings === null ? Prisma.JsonNull : (settings as Prisma.InputJsonValue);

		return await this.#prismaClient.$transaction(async (tx) => {
			await tx.accommodation.updateMany({
				where: { id: { in: accIds } },
				data: { dynamicPricingSettings: settingsValue },
			});

			await tx.accommodationHoliday.deleteMany({
				where: { accommodationId: { in: accIds } },
			});

			if (holidays.length > 0) {
				const batchData = accIds.flatMap((accId) =>
					holidays.map((h) => ({
						accommodationId: accId,
						holidayCode: h.holidayCode,
						priceMultiplier: new Prisma.Decimal(h.priceMultiplier),
						preDays: h.preDays,
						postDays: h.postDays,
						enabled: h.enabled,
					}))
				);
				await tx.accommodationHoliday.createMany({
					data: batchData,
				});
			}

			return { updatedCount: accIds.length };
		});
	}

	public async checkOwnership(id: string, ownerId: string): Promise<boolean> {
		const count = await this.#prismaClient.accommodation.count({
			where: { id, ownerId },
		});
		return count > 0;
	}

	public async getForPublishValidation(id: string, ownerId: string) {
		return await this.#prismaClient.accommodation.findFirst({
			where: { id, ownerId },
			include: {
				address: true,
				policy: true,
				facilities: {
					include: { facility: true },
				},
				rooms: {
					include: { beds: true },
				},
			},
		});
	}

	public async syncFacilities(accommodationId: string, facilities: { facilityId: string; fee?: number; note?: string; isAvailable?: boolean }[]) {
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

	public async getRoomsCapacityByOwnerId(ownerId: string) {
		const accommodations = await this.#prismaClient.accommodation.findMany({
			where: { ownerId },
			select: {
				rooms: { select: { id: true, quantity: true } },
			},
		});

		const rooms = accommodations.flatMap((a) => a.rooms);
		return {
			roomIds: rooms.map((r) => r.id),
			totalRooms: rooms.reduce((sum, r) => sum + r.quantity, 0),
		};
	}

	public async getOwnerDraftDetails(id: string, ownerId: string) {
		return await this.#prismaClient.accommodation.findFirst({
			where: {
				id,
				ownerId,
			},
			include: {
				address: true,
				policy: true,
				facilities: {
					include: { facility: true },
				},
				rooms: {
					include: {
						beds: true,
						amenities: {
							include: {
								amenity: true,
							},
						},
					},
				},
				holidayOptIns: true,
			},
		});
	}

	public async findPolicyByAccommodationId(accommodationId: string) {
		return await this.#prismaClient.accommodationPolicy.findUnique({
			where: { accommodationId },
		});
	}

	public async upsertPolicy(accommodationId: string, data: UpdatePolicyDTO) {
		return await this.#prismaClient.accommodationPolicy.upsert({
			where: { accommodationId },
			create: {
				accommodationId,
				checkInTime: data.checkInTime,
				checkOutTime: data.checkOutTime,
				prepaymentPolicy: data.prepaymentPolicy,
				cancellationPolicy: data.cancellationPolicy,
				cancellationDescription: data.cancellationDescription,
				allowsPets: data.allowsPets ?? false,
				allowsSmoking: data.allowsSmoking ?? false,
				allowsParties: data.allowsParties ?? false,
				quietHoursStart: data.quietHoursStart,
				quietHoursEnd: data.quietHoursEnd,
				additionalRules: data.additionalRules,
			},
			update: {
				checkInTime: data.checkInTime,
				checkOutTime: data.checkOutTime,
				prepaymentPolicy: data.prepaymentPolicy,
				cancellationPolicy: data.cancellationPolicy,
				cancellationDescription: data.cancellationDescription,
				allowsPets: data.allowsPets,
				allowsSmoking: data.allowsSmoking,
				allowsParties: data.allowsParties,
				quietHoursStart: data.quietHoursStart,
				quietHoursEnd: data.quietHoursEnd,
				additionalRules: data.additionalRules,
			},
		});
	}
}

export default AccommodationRepository;
