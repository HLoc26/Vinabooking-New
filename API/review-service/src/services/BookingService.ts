import BookingServiceClient from "../clients/BookingServiceClient";

class BookingService {
	constructor(private client: BookingServiceClient) {}

	/**
	 * Check if booking is booked by user
	 * @param bookingId Booking ID
	 * @param userId User ID (sender ID)
	 */
	public async verify(bookingId: string, userId: string): Promise<boolean> {
		const booking = await this.client.getBooking(bookingId);

		return booking?.userId === userId && booking.status === "COMPLETED";
	}
}

export default BookingService;
