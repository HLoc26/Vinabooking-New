import { injectable } from "tsyringe";
import { Prisma } from "@/generated/client";
import { PrismaProvider } from "@/infrastructure/persistence/PrismaProvider";
import { BaseDao } from "@/infrastructure/persistence/BaseDao";
import type { FloorPriceRule, HolidayOptInData, IPricingRepository } from "@/modules/pricing/repository/IPricingRepository";
import { EItemType } from "@/modules/pricing/enums/EItemType";
import type { PriceableItem } from "@/modules/pricing/domain/PriceableItem";
import type { Holiday } from "@/modules/pricing/domain/Holiday";
import type { HolidayOptIn } from "@/modules/pricing/domain/HolidayOptIn";
import type { DynamicPricingSettings } from "@/modules/pricing/domain/DynamicPricingSettings";
import { PricingEntityMapper } from "@/modules/pricing/dao/mapper/PricingEntityMapper";

/** Prisma-backed implementation of IPricingRepository. The only place pricing touches Prisma. */
@injectable()
export class PricingDao extends BaseDao implements IPricingRepository {
	constructor(
		private readonly prisma: PrismaProvider,
		private readonly mapper: PricingEntityMapper
	) {
		super();
	}

	public async findPriceableItems(refs: { itemType: EItemType; itemId: string }[]): Promise<PriceableItem[]> {
		return this.run(async () => {
			const roomIds = refs.filter((r) => r.itemType === EItemType.ROOM).map((r) => r.itemId);
			const bedIds = refs.filter((r) => r.itemType === EItemType.BED).map((r) => r.itemId);

			const rooms = roomIds.length
				? await this.prisma.client.room.findMany({
						where: { id: { in: roomIds } },
						include: { accommodation: true },
					})
				: [];
			const beds = bedIds.length
				? await this.prisma.client.bed.findMany({
						where: { id: { in: bedIds } },
						include: { room: { include: { accommodation: true } } },
					})
				: [];

			const items: PriceableItem[] = [];
			for (const room of rooms) items.push(this.mapper.roomToPriceableItem(room));
			// A bed with no price has no quotable rate; the service treats it as not found.
			for (const bed of beds) {
				if (bed.price === null) continue;
				items.push(this.mapper.bedToPriceableItem(bed));
			}
			return items;
		});
	}

	public async findAccommodationHolidayOptIns(accommodationId: string): Promise<HolidayOptIn[]> {
		return this.run(async () => {
			const rows = await this.prisma.client.accommodationHoliday.findMany({ where: { accommodationId } });
			return rows.map((r) => this.mapper.optInToDomain(r));
		});
	}

	public async findHolidayAnchors(codes: string[], from: Date, to: Date): Promise<Holiday[]> {
		return this.run(async () => {
			if (codes.length === 0) return [];
			const anchors = await this.prisma.client.holiday.findMany({
				where: {
					OR: [
						{ isRecurring: false, date: { gte: from, lte: to } },
						{ isRecurring: true }, // recurring (sentinel year) — always fetched, matched by MM-DD
					],
					code: { in: codes },
				},
			});
			return anchors.map((a) => this.mapper.holidayToDomain(a));
		});
	}

	public async findHolidayCatalog(): Promise<Holiday[]> {
		return this.run(async () => {
			const holidays = await this.prisma.client.holiday.findMany({ orderBy: [{ date: "asc" }] });
			// One row per logical holiday (first occurrence per code).
			const seen = new Set<string>();
			return holidays
				.filter((h) => {
					if (seen.has(h.code)) return false;
					seen.add(h.code);
					return true;
				})
				.map((h) => this.mapper.holidayToDomain(h));
		});
	}

	public async findOwnerProfileIdByUserId(userId: string): Promise<string | null> {
		return this.run(async () => {
			const profile = await this.prisma.client.ownerProfile.findUnique({
				where: { userId },
				select: { id: true },
			});
			return profile?.id ?? null;
		});
	}

	public async getOwnerDynamicPricingSettings(ownerProfileId: string): Promise<DynamicPricingSettings | null> {
		return this.run(async () => {
			const row = await this.prisma.client.ownerProfile.findUnique({
				where: { id: ownerProfileId },
				select: { dynamicPricingSettings: true },
			});
			return (row?.dynamicPricingSettings ?? null) as DynamicPricingSettings | null;
		});
	}

	public async updateOwnerDynamicPricingSettings(ownerProfileId: string, settings: DynamicPricingSettings | null): Promise<DynamicPricingSettings | null> {
		return this.run(async () => {
			const value: Prisma.NullableJsonNullValueInput | Prisma.InputJsonValue = settings === null ? Prisma.JsonNull : (settings as Prisma.InputJsonValue);
			const updated = await this.prisma.client.ownerProfile.update({
				where: { id: ownerProfileId },
				data: { dynamicPricingSettings: value },
				select: { dynamicPricingSettings: true },
			});
			return (updated.dynamicPricingSettings ?? null) as DynamicPricingSettings | null;
		});
	}

	public async findOwnerHolidayOptIns(ownerProfileId: string): Promise<HolidayOptIn[]> {
		return this.run(async () => {
			const rows = await this.prisma.client.ownerHoliday.findMany({ where: { ownerProfileId } });
			return rows.map((r) => this.mapper.optInToDomain(r));
		});
	}

	public async replaceOwnerHolidayOptIns(ownerProfileId: string, items: HolidayOptInData[]): Promise<HolidayOptIn[]> {
		return this.run(async () => {
			const rows = await this.prisma.client.$transaction(async (tx) => {
				await tx.ownerHoliday.deleteMany({ where: { ownerProfileId } });
				if (items.length === 0) return [];
				await tx.ownerHoliday.createMany({
					data: items.map((i) => ({
						ownerProfileId,
						holidayCode: i.holidayCode,
						priceMultiplier: new Prisma.Decimal(i.priceMultiplier),
						preDays: i.preDays,
						postDays: i.postDays,
						enabled: i.enabled,
					})),
				});
				return tx.ownerHoliday.findMany({ where: { ownerProfileId } });
			});
			return rows.map((r) => this.mapper.optInToDomain(r));
		});
	}

	public async syncAllAccommodationsWithGlobalSettings(ownerId: string, settings: DynamicPricingSettings | null, holidays: HolidayOptInData[]): Promise<number> {
		return this.run(async () => {
			const accommodations = await this.prisma.client.accommodation.findMany({
				where: { ownerId },
				select: { id: true },
			});
			const accIds = accommodations.map((a) => a.id);
			if (accIds.length === 0) return 0;

			const settingsValue: Prisma.NullableJsonNullValueInput | Prisma.InputJsonValue = settings === null ? Prisma.JsonNull : (settings as Prisma.InputJsonValue);

			await this.prisma.client.$transaction(async (tx) => {
				await tx.accommodation.updateMany({
					where: { id: { in: accIds } },
					data: { dynamicPricingSettings: settingsValue },
				});
				await tx.accommodationHoliday.deleteMany({ where: { accommodationId: { in: accIds } } });
				if (holidays.length > 0) {
					const batch = accIds.flatMap((accId) =>
						holidays.map((h) => ({
							accommodationId: accId,
							holidayCode: h.holidayCode,
							priceMultiplier: new Prisma.Decimal(h.priceMultiplier),
							preDays: h.preDays,
							postDays: h.postDays,
							enabled: h.enabled,
						}))
					);
					await tx.accommodationHoliday.createMany({ data: batch });
				}
			});
			return accIds.length;
		});
	}

	public async isAccommodationOwnedBy(accommodationId: string, userId: string): Promise<boolean> {
		return this.run(async () => {
			const count = await this.prisma.client.accommodation.count({
				where: { id: accommodationId, ownerId: userId },
			});
			return count > 0;
		});
	}

	public async bulkUpdateRoomFloorPrices(accommodationId: string, rule: FloorPriceRule): Promise<number> {
		return this.run(async () => {
			const rooms = await this.prisma.client.room.findMany({
				where: { accommodationId },
				select: { id: true, basePrice: true },
			});
			return this.prisma.client.$transaction(async (tx) => {
				for (const room of rooms) {
					const base = Number(room.basePrice);
					const calculated = Math.max(base * (rule.percent / 100), rule.minAmount);
					const finalFloor = Math.min(calculated, base);
					await tx.room.update({
						where: { id: room.id },
						data: { floorPrice: new Prisma.Decimal(finalFloor) },
					});
				}
				return rooms.length;
			});
		});
	}
}
