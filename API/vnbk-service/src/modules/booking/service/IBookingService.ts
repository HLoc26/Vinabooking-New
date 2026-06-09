import type { Booking } from "@/modules/booking/domain/Booking";
import type { CreateBookingRequest } from "@/modules/booking/dto/request/CreateBookingRequest";
import type { BookedCountResponse } from "@/modules/booking/dto/response/BookedCountResponse";

/**
 * Use-case contract for the booking module. The service is THIN: it orchestrates
 * (re-quote + hash check, factory, persistence, event publication) while the
 * lifecycle rules live in the Booking aggregate. confirm/cancel load the
 * aggregate, enforce ownership, invoke the domain mutator, persist, then drain
 * and publish the recorded domain events (which the email handlers consume).
 */
export interface IBookingService {
	/**
	 * Create a PENDING booking. Re-quotes via the pricing engine and rejects with
	 * 409 PRICE_CHANGED if the echoed `quoteHash` no longer matches; verifies
	 * availability against live booked counts before persisting; arms the timeout.
	 */
	create(userId: string, request: CreateBookingRequest): Promise<Booking>;

	/** Create a DRAFT booking — same snapshot, but the hash check is skipped (FE may not have it yet). */
	createDraft(userId: string, request: CreateBookingRequest): Promise<Booking>;

	/** Confirm a booking (PENDING -> BOOKED). Caller must own it; publishes BookingConfirmedEvent. */
	confirm(userId: string, bookingId: string): Promise<Booking>;

	/** Cancel a booking (traveller-initiated). Caller must own it; publishes BookingCancelledEvent. */
	cancel(userId: string, bookingId: string, note?: string): Promise<Booking>;

	/** Booked unit counts per room over the window (availability support). */
	getBookedCounts(roomIds: string[], startDate: Date, endDate: Date): Promise<BookedCountResponse[]>;
}
