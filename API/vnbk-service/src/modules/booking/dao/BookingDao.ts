import { injectable } from "tsyringe";
import { PrismaProvider } from "@/infrastructure/persistence/PrismaProvider";
import { BaseDao } from "@/infrastructure/persistence/BaseDao";
import type { IBookingRepository } from "@/modules/booking/repository/IBookingRepository";
import type { Booking } from "@/modules/booking/domain/Booking";
import { BookingEntityMapper } from "@/modules/booking/dao/mapper/BookingEntityMapper";

/**
 * Prisma-backed implementation of IBookingRepository. The only place Booking
 * touches Prisma. The availability/booked-count queries read this module's OWN
 * Booking/BookingDetail tables (overlapping, status-filtered) — room quantity +
 * bed counts come from the room module's service, so this DAO never reads the
 * rooms/beds tables (module sealing keeps the graph acyclic).
 */
@injectable()
export class BookingDao extends BaseDao implements IBookingRepository {
	constructor(
		private readonly prisma: PrismaProvider,
		private readonly mapper: BookingEntityMapper
	) {
		super();
	}

	public async findById(id: string): Promise<Booking | null> {
		return this.run(async () => {
			const entity = await this.prisma.client.booking.findUnique({
				where: { id },
				include: { details: true },
			});
			return entity ? this.mapper.toDomain(entity) : null;
		});
	}

	public async create(booking: Booking): Promise<Booking> {
		return this.run(async () => {
			const entity = await this.prisma.client.booking.create({
				data: this.mapper.toCreateInput(booking),
				include: { details: true },
			});
			return this.mapper.toDomain(entity);
		});
	}

	public async update(booking: Booking): Promise<Booking> {
		return this.run(async () => {
			const entity = await this.prisma.client.booking.update({
				where: { id: booking.id },
				data: this.mapper.toUpdateInput(booking),
				include: { details: true },
			});
			return this.mapper.toDomain(entity);
		});
	}

	public async countOverlappingBookedItems(itemIds: string[], startDate: Date, endDate: Date): Promise<Record<string, number>> {
		if (itemIds.length === 0) return {};
		return this.run(async () => {
			const details = await this.prisma.client.bookingDetail.findMany({
				where: {
					itemId: { in: itemIds },
					Booking: {
						status: { in: ["PENDING", "BOOKED"] },
						startDate: { lt: endDate },
						endDate: { gt: startDate },
					},
				},
				select: { itemId: true, count: true },
			});

			const counts: Record<string, number> = {};
			for (const itemId of itemIds) counts[itemId] = 0;
			for (const detail of details) {
				counts[detail.itemId] = (counts[detail.itemId] ?? 0) + detail.count;
			}
			return counts;
		});
	}

	public async countBookedRooms(roomIds: string[], startDate: Date, endDate: Date): Promise<Record<string, number>> {
		if (roomIds.length === 0) return {};
		return this.run(async () => {
			const details = await this.prisma.client.bookingDetail.findMany({
				where: {
					itemId: { in: roomIds },
					itemType: "ROOM",
					Booking: {
						status: "BOOKED",
						startDate: { lte: endDate },
						endDate: { gte: startDate },
					},
				},
				select: { itemId: true, count: true },
			});

			const counts: Record<string, number> = {};
			for (const roomId of roomIds) counts[roomId] = 0;
			for (const detail of details) {
				if (counts[detail.itemId] !== undefined) {
					counts[detail.itemId] += detail.count;
				}
			}
			return counts;
		});
	}
}
