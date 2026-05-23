import { PrismaClient, Prisma } from "@/generated/client";
import type { HolidayOptIn } from "@/types/pricing.types";

class HolidayRepository {
	readonly #prismaClient: PrismaClient;

	constructor(prismaClient: PrismaClient) {
		this.#prismaClient = prismaClient;
	}

	// ----- Catalog (read-only, seeded) -----

	public async findAll() {
		// Return distinct codes for the catalog, picking the first name and date found
		// for each code. The UI only needs one row per logical holiday.
		const holidays = await this.#prismaClient.holiday.findMany({
			orderBy: [{ date: "asc" }],
		});
		
		const uniqueCodes = new Set<string>();
		return holidays.filter(h => {
			if (uniqueCodes.has(h.code)) return false;
			uniqueCodes.add(h.code);
			return true;
		});
	}

	// ----- Owner opt-ins -----

	public async findByOwner(ownerProfileId: string) {
		return await this.#prismaClient.ownerHoliday.findMany({
			where: { ownerProfileId },
		});
	}

	/**
	 * Bulk-replace owner opt-ins atomically.
	 */
	public async replaceForOwner(ownerProfileId: string, items: HolidayOptIn[]) {
		return await this.#prismaClient.$transaction(async (tx) => {
			await tx.ownerHoliday.deleteMany({ where: { ownerProfileId } });
			if (items.length === 0) return [];
			await tx.ownerHoliday.createMany({
				data: items.map((i) => ({
					ownerProfileId,
					holidayCode: i.holidayCode,
					priceMultiplier: new Prisma.Decimal(i.priceMultiplier),
					preDays: i.preDays ?? 0,
					postDays: i.postDays ?? 0,
					enabled: i.enabled ?? true,
				})),
			});
			return await tx.ownerHoliday.findMany({
				where: { ownerProfileId },
			});
		});
	}

	// ----- Accommodation opt-ins -----

	public async findByAccommodation(accommodationId: string) {
		return await this.#prismaClient.accommodationHoliday.findMany({
			where: { accommodationId },
		});
	}

	public async replaceForAccommodation(
		accommodationId: string,
		items: HolidayOptIn[],
		tx?: Prisma.TransactionClient
	) {
		const client = tx ?? this.#prismaClient;
		const run = async (c: Prisma.TransactionClient | PrismaClient) => {
			await c.accommodationHoliday.deleteMany({ where: { accommodationId } });
			if (items.length === 0) return [];
			await c.accommodationHoliday.createMany({
				data: items.map((i) => ({
					accommodationId,
					holidayCode: i.holidayCode,
					priceMultiplier: new Prisma.Decimal(i.priceMultiplier),
					preDays: i.preDays ?? 0,
					postDays: i.postDays ?? 0,
					enabled: i.enabled ?? true,
				})),
			});
			return await c.accommodationHoliday.findMany({
				where: { accommodationId },
			});
		};
		if (tx) return run(tx);
		return await this.#prismaClient.$transaction(async (txClient) => run(txClient));
	}

	/**
	 * Snapshot owner opt-ins into a fresh accommodation.
	 */
	public async snapshotOwnerToAccommodation(
		ownerProfileId: string,
		accommodationId: string,
		tx: Prisma.TransactionClient
	) {
		const ownerRows = await tx.ownerHoliday.findMany({ where: { ownerProfileId } });
		if (ownerRows.length === 0) return [];
		await tx.accommodationHoliday.createMany({
			data: ownerRows.map((r) => ({
				accommodationId,
				holidayCode: r.holidayCode,
				priceMultiplier: r.priceMultiplier,
				preDays: r.preDays,
				postDays: r.postDays,
				enabled: r.enabled,
			})),
		});
		return await tx.accommodationHoliday.findMany({
			where: { accommodationId },
		});
	}
}

export default HolidayRepository;
