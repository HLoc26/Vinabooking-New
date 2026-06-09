import type { Booking } from "@/modules/booking/domain/Booking";

/**
 * Domain-facing persistence port for bookings. Returns domain models, never
 * Prisma types. The booked-count queries read this module's OWN
 * Booking/BookingDetail tables — room quantity + bed counts come from the room
 * module's service (so the booking DAO never touches the rooms/beds tables and
 * the module graph stays acyclic).
 */
export interface IBookingRepository {
	/** Load a booking with its detail lines, or null if it does not exist. */
	findById(id: string): Promise<Booking | null>;

	/** Insert a brand-new booking (with its nested details); returns the persisted aggregate. */
	create(booking: Booking): Promise<Booking>;

	/** Persist mutations to an existing booking (status/note/noteBy); returns the refreshed aggregate. */
	update(booking: Booking): Promise<Booking>;

	/**
	 * Sum the booked units per item across bookings that overlap [startDate, endDate)
	 * and are in PENDING or BOOKED status — used by the create-time availability
	 * check. Keyed by itemId (covers both ROOM and BED items).
	 */
	countOverlappingBookedItems(itemIds: string[], startDate: Date, endDate: Date): Promise<Record<string, number>>;

	/**
	 * Sum the BOOKED room units per room id overlapping [startDate, endDate] — the
	 * `getBookedCounts` query (ROOM items only, status BOOKED), keyed by roomId.
	 */
	countBookedRooms(roomIds: string[], startDate: Date, endDate: Date): Promise<Record<string, number>>;
}
