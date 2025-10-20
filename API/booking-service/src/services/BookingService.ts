import BookingRepository from "../repositories/BookingRepository";
import NotFoundError from "../errors/NotFoundError";

export default class BookingService {
    constructor(private readonly bookingRepository: BookingRepository) {}

    public async getBookingById(id: string) {
        const booking = await this.bookingRepository.findById(id);
        if (!booking) throw new NotFoundError(`Booking with id ${id} not found`);
        return booking;
    }
    public async getBookingsByUserId(userId: string) {
        const bookings = await this.bookingRepository.findByUserId(userId);
        if (!bookings || bookings.length === 0)
            throw new Error(`No bookings found for user ${userId}`);
        return bookings;
    }    
}
