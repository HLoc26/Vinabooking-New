/** Booking-module constants (ported from the monolith `constants/booking.ts`). */

/** A PENDING booking auto-expires this many minutes after creation. */
export const BOOKING_TIMEOUT_MINUTES = 15;

/** The PENDING-booking timeout window, in milliseconds (used by the timeout scheduler). */
export const BOOKING_TIMEOUT_MS = BOOKING_TIMEOUT_MINUTES * 60 * 1000;
