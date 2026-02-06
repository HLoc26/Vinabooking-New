import { BookingRepository } from "@/repositories";
import NotFoundError from "../errors/NotFoundError";

export default class BookingService {
	readonly #bookingRepository: BookingRepository;
	constructor(bookingRepository: BookingRepository) {
		this.#bookingRepository = bookingRepository;
	}

	public async getBookingById(id: string) {
		const booking = await this.#bookingRepository.findById(id);
		if (!booking) throw new NotFoundError(`Booking with id ${id} not found`);
		return booking;
	}

	public async getBookingsByUserId(userId: string) {
		const bookings = await this.#bookingRepository.findByUserId(userId);
		if (!bookings || bookings.length === 0) throw new NotFoundError(`No bookings found for user ${userId}`);
		return bookings;
	}

	public async getBookingsByRoomId(roomId: string) {
		const bookings = await this.#bookingRepository.findByRoomId(roomId);
		if (!bookings || bookings.length === 0) throw new NotFoundError(`No bookings found for room ${roomId}`);
		return bookings;
	}

	public async getBookedCounts(roomIds: string[], startDate: Date, endDate: Date) {
		const counts = await this.#bookingRepository.countBookedRooms(roomIds, startDate, endDate);

		return roomIds.map((roomId) => ({
			roomId,
			bookedCount: counts[roomId] ?? 0,
		}));
	}
}
