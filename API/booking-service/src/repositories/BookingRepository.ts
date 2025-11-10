import PrismaSingleton from "../clients/PrismaSingleton";
import { BookingPayload } from "../types/Booking";

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

    // public async findByAccommodationId(accommodationId: string) {
    //     return await this.prisma.booking.findMany({
    //         where: { details: { some: { itemId: accommodationId, itemType: "ACCOMMODATION" } } },
    //         include: { details: true },
    //     });
    // }

    public async createBooking(data: BookingPayload) {
        const bookingData = {
            ...data,
        };

        return await this.prisma.booking.create({
            data: bookingData,
            include: {
                details: true
            }
        });
    }
    public async countBookedRooms(roomIds: string[], startDate: Date, endDate: Date) {
        const counts: Record<string, number> = {};

        for (const roomId of roomIds) {
            const bookings = await this.prisma.booking.findMany({
                where: {
                    status: "BOOKED",
                    details: {
                        some: { itemId: roomId, itemType: "ROOM" },
                    },
                    OR: [
                        {
                            startDate: { lte: endDate },
                            endDate: { gte: startDate },
                        }
                    ]
                },
            });
            counts[roomId] = bookings.length;
        }

        return counts;
    }

}
