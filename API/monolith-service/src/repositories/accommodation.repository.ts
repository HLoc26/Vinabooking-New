import { PrismaClient, Prisma, type EAccommodationType, type EAccommodationStatus } from "@/generated/client";
import { SearchFilters } from "@/dto/request/accommodation.dto";
import { AccommodationWithDetails } from "@/dto/response/accommodation.dto";
import { ESortOption, UpdateAccommodationDTO, UpdateAddressDTO } from "@/dto/request/accommodation.dto";
import type { DynamicPricingSettings } from "@/types/pricing.types";
import { Accommodation } from "@/models/accommodation/accommodation.model";
import { AccommodationMapper } from "@/mappers/accommodation.mapper";

class AccommodationRepository {
	readonly #prismaClient: PrismaClient;

	constructor(prismaClient: PrismaClient) {
		this.#prismaClient = prismaClient;
	}

	public async findById(id: string): Promise<Accommodation | null> {
		const entity = await this.#prismaClient.accommodation.findUnique({
			where: { id },
			include: {
				address: true,
				facilities: { include: { facility: true } },
				holidayOptIns: true,
				rooms: {
					select: { id: true, basePrice: true, floorPrice: true, quantity: true, beds: { select: { id: true } } }
				}
			},
		});
		return entity ? AccommodationMapper.toDomain(entity as any) : null;
	}

	public async findByIdBatch(ids: string[]): Promise<Accommodation[]> {
		const entities = await this.#prismaClient.accommodation.findMany({
			where: { id: { in: ids } },
			include: { 
				address: true, 
				facilities: { include: { facility: true } },
				holidayOptIns: true,
				rooms: {
					select: { id: true, basePrice: true, floorPrice: true, quantity: true, beds: { select: { id: true } } }
				}
			},
		});
		return entities.map(e => AccommodationMapper.toDomain(e as any));
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
			where.AND = filters.facilities.map((facilityName: string) => ({
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
						star: true, // Cái này tự tính trung bình in-memory
					},
				},
			},
			orderBy: { updatedAt: Prisma.SortOrder.desc },
		});
	}

	public async updatePricingSettings(id: string, settings: DynamicPricingSettings | null) {
		const value: Prisma.NullableJsonNullValueInput | Prisma.InputJsonValue =
			settings === null ? Prisma.JsonNull : (settings as Prisma.InputJsonValue);
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

	/**
	 * Force-apply global settings to all accommodations owned by a user.
	 */
	public async syncAllWithGlobalSettings(
		ownerId: string,
		settings: DynamicPricingSettings | null,
		holidays: { holidayCode: string; priceMultiplier: number; preDays: number; postDays: number; enabled: boolean }[]
	) {
		const accommodations = await this.findAllByOwnerId(ownerId);
		const accIds = accommodations.map((a) => a.id);

		if (accIds.length === 0) return { updatedCount: 0 };

		const settingsValue: Prisma.NullableJsonNullValueInput | Prisma.InputJsonValue =
			settings === null ? Prisma.JsonNull : (settings as Prisma.InputJsonValue);

		return await this.#prismaClient.$transaction(async (tx) => {
			// 1. Bulk update JSON settings
			await tx.accommodation.updateMany({
				where: { id: { in: accIds } },
				data: { dynamicPricingSettings: settingsValue },
			});

			// 2. Bulk remove old holiday opt-ins
			await tx.accommodationHoliday.deleteMany({
				where: { accommodationId: { in: accIds } },
			});

			// 3. Bulk insert new holiday opt-ins for all accommodations
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

	public async getForPublishValidation(id: string, ownerId: string): Promise<Accommodation | null> {
		const entity = await this.#prismaClient.accommodation.findFirst({
			where: { id, ownerId },
			include: {
				address: true,
				facilities: {
					include: { facility: true },
				},
				holidayOptIns: true,
				rooms: {
					include: { beds: true },
				},
			},
		});
		return entity ? AccommodationMapper.toDomain(entity as any) : null;
	}

	public async save(accommodation: Accommodation): Promise<void> {
		const data = AccommodationMapper.toPersistence(accommodation);
		const addressData = accommodation.getAddress() ? AccommodationMapper.toAddressPersistence(accommodation.getAddress()!) : null;
		const facilitiesData = accommodation.getFacilities().map(f => ({
			facilityId: f.getFacility().getId(),
			fee: f.getFee(),
			note: f.getNote(),
			isAvailable: f.getIsAvailable()
		}));
		const holidayData = accommodation.getHolidayOptIns().map(h => ({
			holidayCode: h.getHolidayCode(),
			priceMultiplier: new Prisma.Decimal(h.getPriceMultiplier()),
			preDays: h.getPreDays(),
			postDays: h.getPostDays(),
			enabled: h.getEnabled()
		}));

		await this.#prismaClient.$transaction(async (tx) => {
			const existing = await tx.accommodation.findUnique({ where: { id: accommodation.getId() } });

			if (!existing) {
				await tx.accommodation.create({
					data: {
						id: accommodation.getId(),
						name: data.name,
						description: data.description,
						type: data.type,
						rentalType: data.rentalType,
						status: data.status,
						ownerId: data.ownerId,
						dynamicPricingSettings: data.dynamicPricingSettings,
						...(addressData && {
							address: { create: addressData }
						})
					}
				});
			} else {
				await tx.accommodation.update({
					where: { id: accommodation.getId() },
					data: {
						name: data.name,
						description: data.description,
						type: data.type,
						rentalType: data.rentalType,
						status: data.status,
						dynamicPricingSettings: data.dynamicPricingSettings,
						...(addressData && {
							address: {
								upsert: {
									create: addressData,
									update: addressData,
								},
							},
						}),
					},
				});
			}

			// Update Facilities
			await tx.facilityConfig.deleteMany({ where: { accommodationId: accommodation.getId() } });
			if (facilitiesData.length > 0) {
				await tx.facilityConfig.createMany({
					data: facilitiesData.map(f => ({ ...f, accommodationId: accommodation.getId() }))
				});
			}

			// Update Holidays
			await tx.accommodationHoliday.deleteMany({ where: { accommodationId: accommodation.getId() } });
			if (holidayData.length > 0) {
				await tx.accommodationHoliday.createMany({
					data: holidayData.map(h => ({ ...h, accommodationId: accommodation.getId() }))
				});
			}
		});
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
}

export default AccommodationRepository;
