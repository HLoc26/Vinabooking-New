/**
 * Port for the PENDING-booking auto-expiry timeout. In the monolith this enqueues
 * a BullMQ delayed job on create and removes it on confirm; here it is abstracted
 * so the service stays decoupled from the queue infrastructure.
 *
 * NOTE: real BullMQ worker is a later phase — the current adapter only logs.
 */
export interface IBookingTimeoutScheduler {
	/** Schedule (or re-arm) the auto-expiry timeout for a freshly created PENDING booking. */
	schedule(bookingId: string): Promise<void>;
	/** Cancel the auto-expiry timeout (called when a booking is confirmed). */
	cancel(bookingId: string): Promise<void>;
}
