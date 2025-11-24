import PrismaSingleton from "../clients/PrismaSingleton";
import { CreateBookingInput } from "../types/Booking";

export default class BookingRepository {
	private prisma = PrismaSingleton.getInstance();

	public async findById(id: string) {
		return await this.prisma.booking.findUnique({
			where: { id },
			include: { details: true },
		});
	}

	public async findByUserId(userId: string) {
		return await this.prisma.booking.findMany({
			where: { userId },
			include: { details: true },
		});
	}

	public async findByRoomId(roomId: string) {
		return await this.prisma.booking.findMany({
			where: { details: { some: { itemId: roomId, itemType: "ROOM" } } },
			include: { details: true },
		});
	}

	public async createBooking(data: CreateBookingInput) {
		const bookingData = {
			...data,
		};

		return await this.prisma.booking.create({
			data: bookingData,
			include: {
				details: true,
			},
		});
	}

	public async countBookedRooms(roomIds: string[], startDate: Date, endDate: Date) {
		const counts: Record<string, number> = {};

		for (const roomId of roomIds) {
			const details = await this.prisma.bookingDetail.findMany({
				where: {
					itemId: roomId,
					itemType: "ROOM",

					Booking: {
						status: "BOOKED",
						startDate: { lte: endDate },
						endDate: { gte: startDate },
					},
				},
				select: {
					count: true,
				},
			});

			counts[roomId] = details.reduce((sum, d) => sum + d.count, 0);
		}

		return counts;
	}

	public async confirmBooking(id: string) {
		return await this.prisma.booking.update({
			where: { id },
			data: { status: "BOOKED" },
			include: {
				details: true,
			},
		});
	}
}
