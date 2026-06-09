import { injectable } from "tsyringe";
import { Prisma } from "@/generated/client";
import { PrismaProvider } from "@/infrastructure/persistence/PrismaProvider";
import { BaseDao } from "@/infrastructure/persistence/BaseDao";
import { AccommodationEntityMapper } from "@/modules/accommodation/dao/mapper/AccommodationEntityMapper";
import { ESortOption } from "@/modules/accommodation/enums/ESortOption";
import type { EAccommodationType } from "@/modules/accommodation/enums/EAccommodationType";
import type { EAccommodationStatus } from "@/modules/accommodation/enums/EAccommodationStatus";
import type { Accommodation } from "@/modules/accommodation/domain/Accommodation";
import type {
	IAccommodationRepository,
	SearchFilters,
	AccommodationStatsRow,
	StatsResult,
	CreateAccommodationData,
	UpdateBasicInfoData,
	UpdateAddressData,
	FacilityConfigData,
	HolidayOptInData,
	PublishSnapshot,
} from "@/modules/accommodation/repository/IAccommodationRepository";
import type { DynamicPricingSettings } from "@/modules/accommodation/domain/DynamicPricingSettings";

/** The include shape used when loading an accommodation graph (address + facility configs). */
const ACCOMMODATION_DETAIL_INCLUDE = {
	address: true,
	facilities: { include: { facility: true } },
} as const;

// Physical table names (Prisma @@map). The raw stats SQL references these directly.
const ACCOMMODATION_TABLE = "accommodations";
const ROOM_TABLE = "rooms";
const BED_TABLE = "beds";
const REVIEW_TABLE = "Review";

/** Prisma-backed implementation of IAccommodationRepository. The only place Accommodation touches Prisma. */
@injectable()
export class AccommodationDao extends BaseDao implements IAccommodationRepository {
	constructor(
		private readonly prisma: PrismaProvider,
		private readonly mapper: AccommodationEntityMapper
	) {
		super();
	}

	public async findById(id: string): Promise<Accommodation | null> {
		return this.run(async () => {
			const entity = await this.prisma.client.accommodation.findUnique({
				where: { id },
				include: ACCOMMODATION_DETAIL_INCLUDE,
			});
			return entity ? this.mapper.toDomain(entity) : null;
		});
	}

	public async findByIdBatch(ids: string[]): Promise<Accommodation[]> {
		return this.run(async () => {
			if (ids.length === 0) return [];
			const entities = await this.prisma.client.accommodation.findMany({
				where: { id: { in: ids } },
				include: ACCOMMODATION_DETAIL_INCLUDE,
			});
			return entities.map((e) => this.mapper.toDomain(e));
		});
	}

	public async findAccommodationIdByRoomId(roomId: string): Promise<string | null> {
		return this.run(async () => {
			const room = await this.prisma.client.room.findUnique({
				where: { id: roomId },
				select: { accommodationId: true },
			});
			return room?.accommodationId ?? null;
		});
	}

	public async create(data: CreateAccommodationData): Promise<string> {
		return this.run(async () => {
			const settingsValue: Prisma.NullableJsonNullValueInput | Prisma.InputJsonValue =
				data.dynamicPricingSettings === null ? Prisma.JsonNull : (data.dynamicPricingSettings as Prisma.InputJsonValue);

			return this.prisma.client.$transaction(async (tx) => {
				const created = await tx.accommodation.create({
					data: {
						name: data.name,
						description: data.description,
						type: data.type,
						rentalType: data.rentalType,
						status: "DRAFT",
						dynamicPricingSettings: settingsValue,
						owner: { connect: { id: data.ownerId } },
					},
					select: { id: true },
				});

				// Holiday opt-ins: "inherit" snapshots the owner's rows; "explicit" uses the
				// supplied list; "none" leaves the accommodation with no holiday markups.
				let toCreate: HolidayOptInData[] = [];
				if (data.holidayMode === "inherit") {
					toCreate = await this.loadOwnerHolidayOptIns(tx, data.ownerId);
				} else if (data.holidayMode === "explicit") {
					toCreate = data.holidayOptIns;
				}

				if (toCreate.length > 0) {
					await tx.accommodationHoliday.createMany({
						data: toCreate.map((h) => this.toHolidayCreateData(created.id, h)),
					});
				}

				return created.id;
			});
		});
	}

	public async updateBasicInfo(id: string, data: UpdateBasicInfoData): Promise<void> {
		await this.run(async () => {
			await this.prisma.client.accommodation.update({
				where: { id },
				data: {
					name: data.name,
					description: data.description,
					type: data.type,
				},
			});
		});
	}

	public async updateAddress(id: string, data: UpdateAddressData): Promise<void> {
		await this.run(async () => {
			await this.prisma.client.accommodation.update({
				where: { id },
				data: {
					address: {
						upsert: {
							create: data,
							update: data,
						},
					},
				},
			});
		});
	}

	public async syncFacilities(id: string, facilities: FacilityConfigData[]): Promise<void> {
		await this.run(async () => {
			await this.prisma.client.$transaction(async (tx) => {
				await tx.facilityConfig.deleteMany({ where: { accommodationId: id } });
				if (facilities.length > 0) {
					await tx.facilityConfig.createMany({
						data: facilities.map((f) => ({
							accommodationId: id,
							facilityId: f.facilityId,
							fee: f.fee ?? 0,
							note: f.note,
							isAvailable: f.isAvailable ?? true,
						})),
					});
				}
			});
		});
	}

	public async updateStatus(id: string, status: EAccommodationStatus): Promise<void> {
		await this.run(async () => {
			await this.prisma.client.accommodation.update({
				where: { id },
				data: { status },
			});
		});
	}

	public async updatePricingSettings(id: string, settings: DynamicPricingSettings | null): Promise<void> {
		await this.run(async () => {
			const value: Prisma.NullableJsonNullValueInput | Prisma.InputJsonValue =
				settings === null ? Prisma.JsonNull : (settings as Prisma.InputJsonValue);
			await this.prisma.client.accommodation.update({
				where: { id },
				data: { dynamicPricingSettings: value },
				select: { id: true },
			});
		});
	}

	public async replaceHolidayOptIns(id: string, items: HolidayOptInData[]): Promise<void> {
		await this.run(async () => {
			await this.prisma.client.$transaction(async (tx) => {
				await tx.accommodationHoliday.deleteMany({ where: { accommodationId: id } });
				if (items.length > 0) {
					await tx.accommodationHoliday.createMany({
						data: items.map((h) => this.toHolidayCreateData(id, h)),
					});
				}
			});
		});
	}

	public async getPublishSnapshot(id: string, ownerId: string): Promise<PublishSnapshot | null> {
		return this.run(async () => {
			const acc = await this.prisma.client.accommodation.findFirst({
				where: { id, ownerId },
				select: {
					id: true,
					status: true,
					addressId: true,
					rooms: {
						select: {
							name: true,
							basePrice: true,
							floorPrice: true,
							quantity: true,
							_count: { select: { beds: true } },
						},
					},
				},
			});
			if (!acc) return null;
			return {
				id: acc.id,
				status: acc.status as EAccommodationStatus,
				hasAddress: acc.addressId !== null,
				rooms: acc.rooms.map((r) => ({
					name: r.name,
					basePrice: Number(r.basePrice),
					floorPrice: Number(r.floorPrice),
					quantity: r.quantity,
					bedCount: r._count.beds,
				})),
			};
		});
	}

	public async getStatsRows(filters: SearchFilters, offset: number, limit: number, sortBy: ESortOption = ESortOption.NEWEST): Promise<StatsResult> {
		return this.run(async () => {
			const where: Prisma.AccommodationWhereInput = { status: "PUBLISHED" };

			// 1. Keyword (name / city / fullAddress).
			if (filters.keyword) {
				where.OR = [
					{ name: { contains: filters.keyword } },
					{ address: { city: { contains: filters.keyword } } },
					{ address: { fullAddress: { contains: filters.keyword } } },
				];
			}

			// 2. Type.
			if (filters.type) {
				where.type = filters.type;
			}

			// 3. Pre-filtered ids (from room-level filters). An empty array means "no matches".
			if (filters.ids !== undefined) {
				if (filters.ids.length === 0) {
					return { statsRows: [], total: 0 };
				}
				where.id = { in: filters.ids };
			}

			// 4. Facilities (must have ALL named facilities).
			if (filters.facilities && filters.facilities.length > 0) {
				where.AND = filters.facilities.map((facilityName) => ({
					facilities: { some: { facility: { name: facilityName } } },
				}));
			}

			// Total match count (pre-pagination).
			const matchingRecords = await this.prisma.client.accommodation.findMany({
				where,
				select: { id: true },
			});
			const matchedIds = matchingRecords.map((r) => r.id);
			const total = matchedIds.length;
			if (total === 0) {
				return { statsRows: [], total: 0 };
			}

			const orderClause = this.buildOrderClause(sortBy);

			// Raw SQL: minPrice = MIN over rooms (base_price, else the room's cheapest bed price),
			// avgStar / reviewCount over the Review table. Kept encapsulated here in the DAO.
			const statsRows = await this.prisma.client.$queryRaw<AccommodationStatsRow[]>`
				SELECT
					a.id,
					a.name,
					a.createdAt,
					(
						SELECT MIN(
							COALESCE(
								CAST(NULLIF(r.base_price, '') AS DECIMAL(10,2)),
								(SELECT MIN(CAST(b.price AS DECIMAL(10,2))) FROM ${Prisma.raw(BED_TABLE)} b WHERE b.roomId = r.id)
							)
						)
						FROM ${Prisma.raw(ROOM_TABLE)} r
						WHERE r.accommodationId = a.id
					) AS minPrice,
					(
						SELECT AVG(rev.star) FROM ${Prisma.raw(REVIEW_TABLE)} rev WHERE rev.accommodationId = a.id
					) AS avgStar,
					(
						SELECT COUNT(rev.id) FROM ${Prisma.raw(REVIEW_TABLE)} rev WHERE rev.accommodationId = a.id
					) AS reviewCount
				FROM ${Prisma.raw(ACCOMMODATION_TABLE)} a
				WHERE a.id IN (${Prisma.join(matchedIds)})
				${orderClause}
				LIMIT ${limit} OFFSET ${offset}
			`;

			// Normalize Decimal/BigInt raw-query columns to plain JS numbers.
			const normalized = statsRows.map((row) => ({
				id: row.id,
				minPrice: row.minPrice === null ? null : Number(row.minPrice),
				avgStar: row.avgStar === null ? null : Number(row.avgStar),
				reviewCount: Number(row.reviewCount ?? 0),
			}));

			return { statsRows: normalized, total };
		});
	}

	public async count(filters: { city?: string; type?: EAccommodationType }): Promise<number> {
		return this.run(async () => {
			const where: Prisma.AccommodationWhereInput = { status: "PUBLISHED" };
			if (filters.type) where.type = filters.type;
			if (filters.city) where.address = { city: { contains: filters.city } };
			return this.prisma.client.accommodation.count({ where });
		});
	}

	public async countByType(): Promise<{ type: EAccommodationType; count: number }[]> {
		return this.run(async () => {
			const result = await this.prisma.client.accommodation.groupBy({
				by: ["type"],
				where: { status: "PUBLISHED" },
				_count: { id: true },
				orderBy: { _count: { id: "desc" } },
			});
			return result.map((item) => ({ type: item.type as EAccommodationType, count: item._count.id }));
		});
	}

	public async countByCity(): Promise<{ city: string; count: number }[]> {
		return this.run(async () => {
			const result = await this.prisma.client.address.groupBy({
				by: ["city"],
				where: { accommodation: { status: "PUBLISHED" } },
				_count: { id: true },
				orderBy: { _count: { id: "desc" } },
				take: 20,
			});
			return result.map((item) => ({ city: item.city, count: item._count.id }));
		});
	}

	public async findOwnerDefaultSettings(userId: string): Promise<DynamicPricingSettings | null> {
		return this.run(async () => {
			const profile = await this.prisma.client.ownerProfile.findUnique({
				where: { userId },
				select: { dynamicPricingSettings: true },
			});
			return (profile?.dynamicPricingSettings ?? null) as DynamicPricingSettings | null;
		});
	}

	public async findOwnerHolidayOptIns(userId: string): Promise<HolidayOptInData[]> {
		return this.run(async () => {
			const profile = await this.prisma.client.ownerProfile.findUnique({ where: { userId }, select: { id: true } });
			if (!profile) return [];
			const rows = await this.prisma.client.ownerHoliday.findMany({ where: { ownerProfileId: profile.id } });
			return rows.map((r) => this.holidayRowToData(r.holidayCode, Number(r.priceMultiplier), r.preDays, r.postDays, r.enabled));
		});
	}

	public async checkOwnership(id: string, ownerId: string): Promise<boolean> {
		return this.run(async () => {
			const count = await this.prisma.client.accommodation.count({ where: { id, ownerId } });
			return count > 0;
		});
	}

	// --- Helpers ---

	/** Load the owner's holiday opt-ins inside an open transaction (for the create "inherit" path). */
	private async loadOwnerHolidayOptIns(tx: Prisma.TransactionClient, userId: string): Promise<HolidayOptInData[]> {
		const profile = await tx.ownerProfile.findUnique({ where: { userId }, select: { id: true } });
		if (!profile) return [];
		const rows = await tx.ownerHoliday.findMany({ where: { ownerProfileId: profile.id } });
		return rows.map((r) => this.holidayRowToData(r.holidayCode, Number(r.priceMultiplier), r.preDays, r.postDays, r.enabled));
	}

	private holidayRowToData(holidayCode: string, priceMultiplier: number, preDays: number, postDays: number, enabled: boolean): HolidayOptInData {
		return { holidayCode, priceMultiplier, preDays, postDays, enabled };
	}

	private toHolidayCreateData(accommodationId: string, h: HolidayOptInData): Prisma.AccommodationHolidayCreateManyInput {
		return {
			accommodationId,
			holidayCode: h.holidayCode,
			priceMultiplier: new Prisma.Decimal(h.priceMultiplier),
			preDays: h.preDays,
			postDays: h.postDays,
			enabled: h.enabled,
		};
	}

	/** Build the ORDER BY clause for the stats query from the sort option (mirrors the monolith). */
	private buildOrderClause(sortBy: ESortOption): Prisma.Sql {
		switch (sortBy) {
			case ESortOption.RECOMMENDED:
				return Prisma.sql`ORDER BY minPrice IS NULL, avgStar IS NULL, minPrice ASC, avgStar DESC`;
			case ESortOption.PRICE_ASC:
				return Prisma.sql`ORDER BY minPrice IS NULL, minPrice ASC`;
			case ESortOption.PRICE_DESC:
				return Prisma.sql`ORDER BY minPrice IS NULL, minPrice DESC`;
			case ESortOption.NAME_ASC:
				return Prisma.sql`ORDER BY a.name ASC`;
			case ESortOption.NAME_DESC:
				return Prisma.sql`ORDER BY a.name DESC`;
			case ESortOption.RATING:
				return Prisma.sql`ORDER BY avgStar IS NULL, avgStar DESC`;
			case ESortOption.NEWEST:
			default:
				return Prisma.sql`ORDER BY a.createdAt DESC`;
		}
	}
}
