import PrismaSingleton from "../clients/PrismaSingleton";

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

    public async createBooking(data: any) {
        // Force the status to PENDING
        const bookingData = {
            ...data,
            status: "PENDING" // always set to PENDING
        };

        return await this.prisma.booking.create({
            data: bookingData,
            include: {
                details: true
            }
        });
    }
}
