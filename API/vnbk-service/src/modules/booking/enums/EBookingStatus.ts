/**
 * Booking lifecycle status. Defined as a const object + string-union type
 * (mirroring the Prisma generated enum exactly) so domain <-> persistence
 * assignment is friction-free, while keeping the domain free of any
 * `@/generated` import.
 */
export const EBookingStatus = {
	DRAFT: "DRAFT",
	PENDING: "PENDING",
	CANCELLED: "CANCELLED",
	BOOKED: "BOOKED",
	COMPLETED: "COMPLETED",
} as const;

export type EBookingStatus = (typeof EBookingStatus)[keyof typeof EBookingStatus];
