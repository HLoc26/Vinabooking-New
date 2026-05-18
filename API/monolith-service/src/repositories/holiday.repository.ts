import { PrismaClient, Prisma } from "@/generated/client";
import type { HolidayOptIn } from "@/types/pricing.types";

class HolidayRepository {
	readonly #prismaClient: PrismaClient;

	constructor(prismaClient: PrismaClient) {
		this.#prismaClient = prismaClient;
	}

	// ----- Catalog (read-only, seeded) -----

	public async findAll() {
		return await this.#prismaClient.holiday.findMany({
			orderBy: [{ date: "asc" }],
		});
	}

	/**
	 * Return all Holiday rows that could match any date in the given array:
	 *  - explicit (isRecurring=false) where `date` is exactly in the array
	 *  - all recurring (isRecurring=true) rows; the caller will filter by MM-DD match
	 * Combine into Map<YYYY-MM-DD, Holiday> in the service layer.
	 */
	public async findRelevantForDates(dates: Date[]) {
		if (!dates || dates.length === 0) return [];
		const explicit = await this.#prismaClient.holiday.findMany({
			where: { date: { in: dates }, isRecurring: false },
		});
		const recurring = await this.#prismaClient.holiday.findMany({
			where: { isRecurring: true },
		});
		return [...explicit, ...recurring];
	}

	// ----- Owner opt-ins -----

	public async findByOwner(ownerProfileId: string) {
		return await this.#prismaClient.ownerHoliday.findMany({
			where: { ownerProfileId },
			include: { holiday: true },
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
					holidayId: i.holidayId,
					priceMultiplier: new Prisma.Decimal(i.priceMultiplier),
					enabled: i.enabled ?? true,
				})),
			});
			return await tx.ownerHoliday.findMany({
				where: { ownerProfileId },
				include: { holiday: true },
			});
		});
	}

	// ----- Accommodation opt-ins -----

	public async findByAccommodation(accommodationId: string) {
		return await this.#prismaClient.accommodationHoliday.findMany({
			where: { accommodationId },
			include: { holiday: true },
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
					holidayId: i.holidayId,
					priceMultiplier: new Prisma.Decimal(i.priceMultiplier),
					enabled: i.enabled ?? true,
				})),
			});
			return await c.accommodationHoliday.findMany({
				where: { accommodationId },
				include: { holiday: true },
			});
		};
		if (tx) return run(tx);
		return await this.#prismaClient.$transaction(async (txClient) => run(txClient));
	}

	/**
	 * Snapshot owner opt-ins into a fresh accommodation. Used at accommodation create
	 * when DTO omits holidayOptIns (inherit from owner defaults).
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
				holidayId: r.holidayId,
				priceMultiplier: r.priceMultiplier,
				enabled: r.enabled,
			})),
		});
		return await tx.accommodationHoliday.findMany({
			where: { accommodationId },
			include: { holiday: true },
		});
	}
}

export default HolidayRepository;
