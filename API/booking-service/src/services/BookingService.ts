import BookingRepository from "../repositories/BookingRepository";
import NotFoundError from "../errors/NotFoundError";

export default class BookingService {
    constructor(private readonly bookingRepository: BookingRepository) {}

    public async getBookingById(id: string) {
        const booking = await this.bookingRepository.findById(id);
        if (!booking) throw new NotFoundError(`Booking with id ${id} not found`);
        return booking;
    }
}
