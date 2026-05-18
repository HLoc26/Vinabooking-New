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

	public async findByReferenceNo(referenceNo: number): Promise<Booking | null> {
		return this.#prismaClient.booking.findUnique({
			where: { referenceNo },
			include: { details: true },
		});
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

	async #findOne<T extends boolean>(where: Prisma.BookingWhereUniqueInput, withDetails?: T): Promise<(T extends true ? BookingWithDetails : Booking) | null> {
		const booking = await this.#prismaClient.booking.findUnique({
			where,
			include: withDetails ? { details: true, paymentTransfers: true } : { paymentTransfers: true },
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

	public async cancelWithTransaction(id: string): Promise<BookingWithDetails> {
		const [booking] = await this.#prismaClient.$transaction([
			this.#prismaClient.booking.update({
				where: { id },
				data: { status: "CANCELLED" },
				include: { details: true },
			}),
			this.#prismaClient.paymentTransfer.updateMany({
				where: { bookingId: id, status: "PENDING" },
				data: { status: "FAILED" }
			})
		]);
		return booking as BookingWithDetails;
	}

	// ---------- room availability ----------
	public async checkAvailability(requestedItems: { itemId: string; count: number; itemType: string }[], startDate: Date, endDate: Date): Promise<boolean> {
		const itemIds = requestedItems.map((item) => item.itemId);
		const roomIds = requestedItems.filter((item) => item.itemType === "ROOM").map((item) => item.itemId);
		const bedIds = requestedItems.filter((item) => item.itemType === "BED").map((item) => item.itemId);

		const [overlappingDetails, rooms, beds] = await Promise.all([
			this.#prismaClient.bookingDetail.findMany({
				where: {
					itemId: { in: itemIds },
					Booking: {
						status: { in: ["PENDING", "BOOKED"] },
						startDate: { lt: endDate },
						endDate: { gt: startDate },
					},
				},
			}),
			roomIds.length > 0 ? this.#prismaClient.room.findMany({ where: { id: { in: roomIds } } }) : Promise.resolve([]),
			bedIds.length > 0 ? this.#prismaClient.bed.findMany({ where: { id: { in: bedIds } } }) : Promise.resolve([]),
		]);

		const bookedCountMap = overlappingDetails.reduce((acc, detail) => {
			acc[detail.itemId] = (acc[detail.itemId] || 0) + detail.count;
			return acc;
		}, {} as Record<string, number>);

		const roomMap = new Map(rooms.map((room) => [room.id, room.quantity]));
		const bedMap = new Map(beds.map((bed) => [bed.id, bed.quantity]));

		for (const reqItem of requestedItems) {
			const bookedCount = bookedCountMap[reqItem.itemId] || 0;

			let totalQuantity = 0;
			if (reqItem.itemType === "ROOM") {
				totalQuantity = roomMap.get(reqItem.itemId) || 0;
			} else if (reqItem.itemType === "BED") {
				totalQuantity = bedMap.get(reqItem.itemId) || 0;
			}

			if (bookedCount + reqItem.count > totalQuantity) {
				return false;
			}
		}
		return true;
	}

	public async countBookedRooms(roomIds: string[], startDate: Date, endDate: Date): Promise<Record<string, number>> {
		const details = await this.#prismaClient.bookingDetail.findMany({
			where: {
				itemId: { in: roomIds },
				itemType: "ROOM",
				Booking: {
					status: "BOOKED",
					startDate: { lte: endDate },
					endDate: { gte: startDate },
				},
			},
			select: { itemId: true, count: true },
		});

		const counts: Record<string, number> = {};
		for (const roomId of roomIds) {
			counts[roomId] = 0;
		}

		for (const d of details) {
			if (counts[d.itemId] !== undefined) {
				counts[d.itemId] += d.count;
			}
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
