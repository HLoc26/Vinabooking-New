import { PrismaClient, Prisma, Booking, BookingDetail, PaymentTransfer, User } from "@/generated/client";

export type BookingWithDetails = Booking & {
	details: BookingDetail[];
};

export type OwnerBookingStatus = "PENDING" | "CANCELLED" | "BOOKED" | "COMPLETED";
export type OwnerBookingSort = "newest" | "oldest" | "price_desc" | "price_asc";

export type OwnerBookingFilters = {
	status?: OwnerBookingStatus;
	accommodationId?: string;
	fromDay?: string;
	toDay?: string;
	sort?: OwnerBookingSort;
};

export type OwnerBookingRecord = Booking & {
	details: BookingDetail[];
	user: Pick<User, "id" | "name" | "email" | "phone">;
	paymentTransfers: PaymentTransfer[];
};

export type OwnerBookingItemMeta = {
	id: string;
	name: string;
	type: "ROOM" | "BED";
	accommodationId: string;
	accommodationName: string;
};

export type OwnerBookingQueryResult = {
	bookings: OwnerBookingRecord[];
	itemMap: Record<string, OwnerBookingItemMeta>;
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

	public async findOwnerBookings(ownerId: string, filters: OwnerBookingFilters): Promise<OwnerBookingQueryResult> {
		const accommodationWhere: Prisma.AccommodationWhereInput = {
			ownerId,
			...(filters.accommodationId ? { id: filters.accommodationId } : {}),
		};

		const rooms = await this.#prismaClient.room.findMany({
			where: {
				accommodation: accommodationWhere,
			},
			select: {
				id: true,
				name: true,
				accommodationId: true,
				accommodation: {
					select: {
						id: true,
						name: true,
					},
				},
				beds: {
					select: {
						id: true,
						name: true,
					},
				},
			},
		});

		if (rooms.length === 0) return { bookings: [], itemMap: {} };

		const roomIds = rooms.map((room) => room.id);
		const bedIds = rooms.flatMap((room) => room.beds.map((bed) => bed.id));
		const itemMap: Record<string, OwnerBookingItemMeta> = {};

		rooms.forEach((room) => {
			itemMap[room.id] = {
				id: room.id,
				name: room.name,
				type: "ROOM",
				accommodationId: room.accommodationId,
				accommodationName: room.accommodation.name,
			};
			room.beds.forEach((bed) => {
				itemMap[bed.id] = {
					id: bed.id,
					name: bed.name ?? "Bed",
					type: "BED",
					accommodationId: room.accommodationId,
					accommodationName: room.accommodation.name,
				};
			});
		});

		const where: Prisma.BookingWhereInput = {
			status: filters.status ? filters.status : { in: ["PENDING", "CANCELLED", "BOOKED", "COMPLETED"] },
			details: {
				some: {
					OR: [
						{ itemType: "ROOM", itemId: { in: roomIds } },
						{ itemType: "BED", itemId: { in: bedIds } },
					],
				},
			},
		};

		if (filters.fromDay || filters.toDay) {
			const startDateFilter: Prisma.DateTimeFilter = {};
			if (filters.fromDay) {
				startDateFilter.gte = new Date(`${filters.fromDay}T00:00:00.000Z`);
			}
			if (filters.toDay) {
				const end = new Date(`${filters.toDay}T00:00:00.000Z`);
				end.setUTCDate(end.getUTCDate() + 1);
				startDateFilter.lt = end;
			}
			where.startDate = startDateFilter;
		}

		const orderBy: Prisma.BookingOrderByWithRelationInput =
			filters.sort === "oldest"
				? { startDate: "asc" }
				: filters.sort === "price_desc"
					? { totalPrice: "desc" }
					: filters.sort === "price_asc"
						? { totalPrice: "asc" }
						: { startDate: "desc" };

		const bookings = await this.#prismaClient.booking.findMany({
			where,
			orderBy,
			include: {
				details: true,
				user: {
					select: {
						id: true,
						name: true,
						email: true,
						phone: true,
					},
				},
				paymentTransfers: {
					orderBy: { createdAt: "desc" },
					take: 1,
				},
			},
		});

		return { bookings, itemMap };
	}

	public async isOwnedByOwner(bookingId: string, ownerId: string): Promise<boolean> {
		const booking = await this.#prismaClient.booking.findUnique({
			where: { id: bookingId },
			select: {
				details: {
					select: {
						itemId: true,
						itemType: true,
					},
				},
			},
		});

		if (!booking) return false;

		const roomIds = booking.details.filter((detail) => detail.itemType === "ROOM").map((detail) => detail.itemId);
		const bedIds = booking.details.filter((detail) => detail.itemType === "BED").map((detail) => detail.itemId);

		const matchingRooms = await this.#prismaClient.room.count({
			where: {
				OR: [
					{ id: { in: roomIds }, accommodation: { ownerId } },
					{ beds: { some: { id: { in: bedIds } } }, accommodation: { ownerId } },
				],
			},
		});

		return matchingRooms > 0;
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
