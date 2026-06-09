import { injectable } from "tsyringe";
import type { IBookingTimeoutScheduler } from "@/modules/booking/service/IBookingTimeoutScheduler";
import { BOOKING_TIMEOUT_MS } from "@/modules/booking/booking.constants";

/**
 * No-op stand-in for the PENDING-booking timeout. It only logs what a real
 * scheduler would do, keeping create/confirm working without a queue worker.
 *
 * NOTE: real BullMQ worker is a later phase. When it lands, swap this binding for
 * a BullMQ-backed adapter that enqueues a delayed job on `schedule` (delay =
 * BOOKING_TIMEOUT_MS, jobId = bookingId) and removes it on `cancel`.
 */
@injectable()
export class LoggingBookingTimeoutScheduler implements IBookingTimeoutScheduler {
	public async schedule(bookingId: string): Promise<void> {
		console.log(`[BookingTimeout] would schedule timeout for booking ${bookingId} (delay ${BOOKING_TIMEOUT_MS}ms)`);
	}

	public async cancel(bookingId: string): Promise<void> {
		console.log(`[BookingTimeout] would cancel timeout for booking ${bookingId}`);
	}
}
