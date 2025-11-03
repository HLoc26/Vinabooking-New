import BookingRepository from "../repositories/BookingRepository";
import NotFoundError from "../errors/NotFoundError";

export default class BookingService {
    constructor(private readonly bookingRepository: BookingRepository) { }

    public async getBookingById(id: string) {
        const booking = await this.bookingRepository.findById(id);
        if (!booking) throw new NotFoundError(`Booking with id ${id} not found`);
        return booking;
    }

    public async getBookingsByUserId(userId: string) {
        const bookings = await this.bookingRepository.findByUserId(userId);
        if (!bookings || bookings.length === 0)
            throw new NotFoundError(`No bookings found for user ${userId}`);
        return bookings;
    }

    public async getBookingsByRoomId(roomId: string) {
        const bookings = await this.bookingRepository.findByRoomId(roomId);
        if (!bookings || bookings.length === 0)
            throw new NotFoundError(`No bookings found for room ${roomId}`);
        return bookings;
    }

    // public async getBookingsByAccommodationId(accommodationId: string) {
    //     const bookings = await this.bookingRepository.findByAccommodationId(accommodationId);
    //     if (!bookings || bookings.length === 0)
    //         throw new NotFoundError(`No bookings found for accommodation ${accommodationId}`);
    //     return bookings;
    // }

    public async createBooking(data: any) {
        try {
            return await this.bookingRepository.createBooking(data);
        } catch (err) {
            throw err;
        }
    }
}
