import { PrismaClient, Prisma, Booking, BookingDetail } from "@/generated/client";

export type BookingWithDetails = Booking & {
	details: BookingDetail[];
};

class BookingRepository {
	readonly #prismaClient: PrismaClient;

	constructor(prismaClient: PrismaClient) {
		this.#prismaClient = prismaClient;
	}

	// ---------- findById ----------
	public async findById<T extends boolean = false>(id: string, withDetails?: T): Promise<(T extends true ? BookingWithDetails : Booking) | null> {
		return this.#findOne({ id }, withDetails);
	}

	// ---------- findByUser ----------
	public async findByUserId<T extends boolean = true>(userId: string, withDetails: boolean = true): Promise<T extends true ? BookingWithDetails[] : Booking[]> {
		const bookings = await this.#prismaClient.booking.findMany({
			where: { userId },
			include: withDetails ? { details: true } : undefined,
		});

		return bookings as T extends true ? BookingWithDetails[] : Booking[];
	}

	public async findByRoomId(roomId: string) {
		return await this.#prismaClient.booking.findMany({
			where: { details: { some: { itemId: roomId, itemType: "ROOM" } } },
			include: { details: true },
		});
	}

	public async findByAccommodationId(accommId: string): Promise<BookingWithDetails[]> {
		// Find all rooms and their beds for the given accommodation
		const rooms = await this.#prismaClient.room.findMany({
			where: {
				accommodationId: accommId,
			},
			select: {
				id: true,
				beds: {
					select: {
						id: true,
					},
				},
			},
		});

		if (rooms.length === 0) {
			return [];
		}

		const roomIds = rooms.map((room) => room.id);
		const bedIds = rooms.flatMap((room) => room.beds.map((bed) => bed.id));

		return this.#prismaClient.booking.findMany({
			where: {
				details: {
					some: {
						OR: [
							{
								itemType: "ROOM",
								itemId: {
									in: roomIds,
								},
							},
							{
								itemType: "BED",
								itemId: {
									in: bedIds,
								},
							},
						],
					},
				},
			},
			include: {
				details: true,
			},
		});
	}

	// ---------- internal shared finder ----------
	async #findOne<T extends boolean>(where: Prisma.BookingWhereUniqueInput, withDetails?: T): Promise<(T extends true ? BookingWithDetails : Booking) | null> {
		const booking = await this.#prismaClient.booking.findUnique({
			where,
			include: withDetails ? { details: true } : undefined,
		});

		return booking as (T extends true ? BookingWithDetails : Booking) | null;
	}

	// ---------- create ----------
	public async create(data: Prisma.BookingCreateInput): Promise<BookingWithDetails> {
		return this.#prismaClient.booking.create({
			data,
			include: {
				details: true,
			},
		});
	}

	// ---------- status updates ----------
	public async confirm(id: string): Promise<BookingWithDetails> {
		return this.#prismaClient.booking.update({
			where: { id },
			data: { status: "BOOKED" },
			include: { details: true },
		});
	}

	public async cancel(id: string): Promise<BookingWithDetails> {
		return this.#prismaClient.booking.update({
			where: { id },
			data: { status: "CANCELLED" },
			include: { details: true },
		});
	}

	// ---------- room availability ----------
	public async countBookedRooms(roomIds: string[], startDate: Date, endDate: Date): Promise<Record<string, number>> {
		const counts: Record<string, number> = {};

		for (const roomId of roomIds) {
			const details = await this.#prismaClient.bookingDetail.findMany({
				where: {
					itemId: roomId,
					itemType: "ROOM",
					Booking: {
						status: "BOOKED",
						startDate: { lte: endDate },
						endDate: { gte: startDate },
					},
				},
				select: { count: true },
			});

			counts[roomId] = details.reduce((sum, d) => sum + d.count, 0);
		}

		return counts;
	}

	public async getDashboardBookings(roomIds: string[], startOfMonth: Date) {
		return await this.#prismaClient.booking.findMany({
			where: {
				details: { some: { itemType: "ROOM", itemId: { in: roomIds } } },
				OR: [{ status: "PENDING" }, { status: { in: ["BOOKED", "COMPLETED"] }, createdAt: { gte: startOfMonth } }],
			},
			include: { details: true },
		});
	}
}

export default BookingRepository;
