import PrismaSingleton from "../clients/PrismaSingleton";

export default class BookingRepository {
    private prisma = PrismaSingleton.getInstance();

    public async findById(id: string) {
        return await this.prisma.booking.findUnique({
            where: { id },
            include: {
                details: true,
            },
        });
    }
}
