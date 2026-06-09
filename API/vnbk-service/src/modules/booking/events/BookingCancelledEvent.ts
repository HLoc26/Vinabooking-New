import { DomainEvent } from "@/shared/events/DomainEvent";
import type { ECancellationSource } from "@/modules/booking/enums/ECancellationSource";

/**
 * Raised by the Booking aggregate when it is cancelled. Carries exactly what the
 * cross-module cancellation-email handler needs (so it never reaches back into
 * persistence): the booking id (+ reference no), the guest/leader contact, the
 * first item summary, the cancellation note, and who cancelled it.
 *
 * `roomId` is the first detail's itemId — the handler resolves the owning
 * accommodation from it via `IAccommodationService.getAccommodationByRoomId`.
 */
export class BookingCancelledEvent extends DomainEvent {
	public static readonly NAME = "booking.cancelled";
	public readonly name = BookingCancelledEvent.NAME;

	constructor(
		public readonly bookingId: string,
		public readonly userId: string,
		public readonly referenceNo: number,
		public readonly roomId: string,
		public readonly itemType: string,
		public readonly leaderName: string | null,
		public readonly leaderEmail: string | null,
		public readonly nights: number,
		public readonly source: ECancellationSource | null,
		public readonly note: string | null
	) {
		super();
	}
}
