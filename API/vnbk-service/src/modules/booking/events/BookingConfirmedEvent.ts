import { DomainEvent } from "@/shared/events/DomainEvent";

/**
 * Raised by the Booking aggregate when it transitions PENDING -> BOOKED. Carries
 * exactly what the cross-module confirmation-email handler needs, so the handler
 * never reaches back into the booking's persistence: the booking id (+ reference
 * no), the guest/leader contact, the stay window + item summary, and the total.
 *
 * `roomId` is the first detail's itemId — the handler resolves the owning
 * accommodation from it via `IAccommodationService.getAccommodationByRoomId`.
 */
export class BookingConfirmedEvent extends DomainEvent {
	public static readonly NAME = "booking.confirmed";
	public readonly name = BookingConfirmedEvent.NAME;

	constructor(
		public readonly bookingId: string,
		public readonly userId: string,
		public readonly referenceNo: number,
		public readonly roomId: string,
		public readonly itemType: string,
		public readonly leaderName: string | null,
		public readonly leaderEmail: string | null,
		public readonly checkIn: Date,
		public readonly checkOut: Date,
		public readonly guestCount: number,
		public readonly nights: number,
		public readonly specialRequest: string | null,
		public readonly totalPrice: number | null
	) {
		super();
	}
}
