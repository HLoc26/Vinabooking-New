import { BookingRepository, RoomRepository } from "@/repositories";
import { NotFoundError, ConflictError, BadRequestError } from "@/errors";
import UserService from "./user.service";
import EmailService from "./email.service";
import AccommodationService from "./accommodation.service";
import PricingService from "./pricing.service";
import { BookingPayload } from "@/types/requests";
import { ECancellationSource, Prisma } from "@/generated/client";
import { CancellationEmailData, ConfirmationEmailData } from "@/types/email.types";
import { bookingTimeoutQueue } from "@/clients/queue.client";
import { BOOKING_TIMEOUT_MS } from "@/constants/booking";
import type { OwnerBookingFilters } from "@/repositories/booking.repository";

type CancelBookingActor = "owner" | "traveller" | "system";

type CancelBookingOptions = {
	note?: string;
	cancelledBy?: CancelBookingActor;
	requestedByUserId?: string;
};

const cancellationSourceMap: Record<CancelBookingActor, ECancellationSource> = {
	owner: "OWNER",
	traveller: "TRAVELLER",
	system: "SYSTEM",
};
import type { QuoteRequest, QuoteResponse } from "@/types/pricing.types";

export default class BookingService {
	readonly #bookingRepository: BookingRepository;
	readonly #roomRepository: RoomRepository;
	readonly #userService: UserService;
	readonly #emailService: EmailService;
	#accommodationService?: AccommodationService;
	#pricingService?: PricingService;

	constructor(bookingRepository: BookingRepository, roomRepository: RoomRepository, userService: UserService, emailService: EmailService) {
		this.#bookingRepository = bookingRepository;
		this.#roomRepository = roomRepository;
		this.#userService = userService;
		this.#emailService = emailService;
	}

	public setAccommodationService(accommodationService: AccommodationService) {
		this.#accommodationService = accommodationService;
	}

	public setPricingService(pricingService: PricingService) {
		this.#pricingService = pricingService;
	}

	private async _quoteForBooking(data: BookingPayload): Promise<QuoteResponse> {
		if (!this.#pricingService) throw new Error("PricingService not wired in BookingService");
		const req: QuoteRequest = {
			checkIn: new Date(data.startDate),
			checkOut: new Date(data.endDate),
			items: data.details.create.map((d) => ({
				itemType: d.itemType,
				itemId: d.itemId,
				count: d.count,
			})),
		};
		return await this.#pricingService.quote(req);
	}

	public async getBookingById(id: string) {
		const booking = await this.#bookingRepository.findById(id, true);
		if (!booking) throw new NotFoundError(`Booking with id ${id} not found`);
		return booking;
	}

	public async getBookingsByAccommodationId(accommId: string) {
		const bookings = await this.#bookingRepository.findByAccommodationId(accommId);
		if (!bookings || bookings.length === 0) throw new NotFoundError(`No bookings found for user ${accommId}`);
		return bookings;
	}

	public async getBookingsByUserId(userId: string) {
		const bookings = await this.#bookingRepository.findByUserId(userId, true);
		//if (!bookings || bookings.length === 0) throw new NotFoundError(`No bookings found for user ${userId}`);
		return bookings || [];
	}

	public async getBookingsByRoomId(roomId: string) {
		const bookings = await this.#bookingRepository.findByRoomId(roomId);
		if (!bookings || bookings.length === 0) throw new NotFoundError(`No bookings found for room ${roomId}`);
		return bookings;
	}

	public async getOwnerBookings(ownerId: string, filters: OwnerBookingFilters) {
		const { bookings, itemMap } = await this.#bookingRepository.findOwnerBookings(ownerId, filters);

		return bookings.map((booking) => {
			const nights = Math.max(1, Math.ceil((booking.endDate.getTime() - booking.startDate.getTime()) / (1000 * 60 * 60 * 24)));
			const items = booking.details.map((detail) => {
				const meta = itemMap[detail.itemId];
				return {
					id: detail.itemId,
					type: detail.itemType,
					name: meta?.name ?? detail.itemType,
					count: detail.count,
					note: detail.note,
				};
			});
			const firstMeta = booking.details.map((detail) => itemMap[detail.itemId]).find(Boolean);
			const latestPayment = booking.paymentTransfers[0] ?? null;

			return {
				id: booking.id,
				referenceNo: booking.referenceNo,
				status: booking.status,
				startDate: booking.startDate,
				endDate: booking.endDate,
				guestCount: booking.guestCount,
				nights,
				totalPrice: booking.totalPrice?.toString() ?? null,
				phone: booking.phone,
				leaderName: booking.leaderName,
				leaderEmail: booking.leaderEmail,
				note: booking.note,
				noteBy: booking.noteBy,
				createdAt: booking.createdAt,
				updatedAt: booking.updatedAt,
				paymentStatus: latestPayment?.status ?? null,
				guest: {
					id: booking.user.id,
					name: booking.user.name,
					email: booking.user.email,
					phone: booking.user.phone,
				},
				accommodation: firstMeta
					? {
							id: firstMeta.accommodationId,
							name: firstMeta.accommodationName,
						}
					: null,
				items,
			};
		});
	}

	public async revokeOwnerBooking(ownerId: string, bookingId: string, note?: string) {
		const booking = await this.getBookingById(bookingId);

		if (booking.status !== "PENDING" && booking.status !== "BOOKED") {
			throw new BadRequestError("Only pending or booked bookings can be revoked");
		}

		const isOwned = await this.#bookingRepository.isOwnedByOwner(bookingId, ownerId);
		if (!isOwned) {
			throw new BadRequestError("Booking does not belong to this owner");
		}

		return this.cancelBooking(bookingId, { note, cancelledBy: "owner" });
	}

	public async getBookedCounts(roomIds: string[], startDate: Date, endDate: Date) {
		const counts = await this.#bookingRepository.countBookedRooms(roomIds, startDate, endDate);

		return roomIds.map((roomId) => ({
			roomId,
			bookedCount: counts[roomId] ?? 0,
		}));
	}

	public async createBooking(userId: string, data: BookingPayload) {
		const quote = await this._quoteForBooking(data);
		if (data.quoteHash !== quote.quoteHash) {
			throw new ConflictError("Price changed since the quote — please re-quote and try again", "PRICE_CHANGED");
		}
		const { quoteHash: _, ...rest } = data;
		const bookingData: Prisma.BookingCreateInput = {
			...rest,
			totalPrice: new Prisma.Decimal(quote.totals.payablePrice),
			pricingSnapshot: quote as unknown as Prisma.InputJsonValue,
			user: { connect: { id: userId } },
			status: "PENDING",
			referenceNo: Number((Date.now() % 1e7) * 100 + Math.floor(Math.random() * 100)),
		};

		const newBooking = await this.#bookingRepository.create(bookingData);
		await bookingTimeoutQueue.add("timeout", { bookingId: newBooking.id }, { delay: BOOKING_TIMEOUT_MS, jobId: newBooking.id });
		return newBooking;
	}

	public async createDraftBooking(userId: string, data: BookingPayload) {
		// Draft booking: compute snapshot but skip the hash check (FE may not have it yet).
		const quote = await this._quoteForBooking(data);
		const { quoteHash: _, ...rest } = data;
		const bookingData: Prisma.BookingCreateInput = {
			...rest,
			totalPrice: new Prisma.Decimal(quote.totals.payablePrice),
			pricingSnapshot: quote as unknown as Prisma.InputJsonValue,
			user: { connect: { id: userId } },
			status: "DRAFT",
			referenceNo: Number((Date.now() % 1e7) * 100 + Math.floor(Math.random() * 100)),
		};
		return await this.#bookingRepository.create(bookingData);
	}

	public async confirmBooking(id: string) {
		if (!this.#accommodationService) throw new Error("AccommodationService not initialized in BookingService");

		// Remove timeout job from queue if it exists
		await bookingTimeoutQueue.remove(id);

		// 1. Confirm booking
		const booking = await this.#bookingRepository.confirm(id);
		console.log(`[BookingService] Booking confirmed: ${JSON.stringify(booking)}`);
		if (!booking) throw new NotFoundError("Booking not found");

		// Ensure the necessary fields for email are present on the booking object
		if (!booking.leaderEmail || !booking.leaderName) {
			throw new Error("Booking object is missing leaderEmail or leaderName required for confirmation email.");
		}

		const firstDetail = booking.details[0];

		// Get accommodation
		const accommodation = await this.#accommodationService.getAccommodationByRoomId(firstDetail.itemId);

		// Get user using booking.leaderEmail and booking.leaderName
		const user = await this.#userService.getUserById(booking.userId);

		if (!user) {
			throw new NotFoundError(`User with id ${booking.userId} not found`);
		}

		// Build check-in / check-out display format
		const checkIn = booking.startDate.toLocaleDateString("en-US", {
			weekday: "long",
			year: "numeric",
			month: "long",
			day: "numeric",
		});

		const checkOut = booking.endDate.toLocaleDateString("en-US", {
			weekday: "long",
			year: "numeric",
			month: "long",
			day: "numeric",
		});
		const totalChargeDisplay = booking.totalPrice ? booking.totalPrice.toString() : undefined;

		// 5. Prepare email payload
		const userEmailData: ConfirmationEmailData = {
			to: user.email,
			accommodation,
			checkIn,
			checkOut,
			guestName: user.name,
			referenceNo: booking.referenceNo,
			roomType: firstDetail.itemType,
			guestCount: booking.guestCount,
			nights: firstDetail.count,
			specialRequest: firstDetail.note || undefined,
			totalCharge: totalChargeDisplay,
		};

		const leaderEmailData: ConfirmationEmailData = {
			to: booking.leaderEmail,
			accommodation,
			checkIn,
			checkOut,
			guestName: booking.leaderName,
			referenceNo: booking.referenceNo,
			roomType: firstDetail.itemType,
			guestCount: booking.guestCount,
			nights: firstDetail.count,
			specialRequest: firstDetail.note || undefined,
			totalCharge: totalChargeDisplay,
		};

		// 6. Send email
		await this.#emailService.sendConfirmationEmail(userEmailData);
		if (user.email !== booking.leaderEmail) {
			await this.#emailService.sendConfirmationEmail(leaderEmailData);
		}

		return booking;
	}

	public async cancelBooking(id: string, options: CancelBookingOptions = {}) {
		if (!this.#accommodationService) throw new Error("AccommodationService not initialized in BookingService");

		const existingBooking = await this.getBookingById(id);
		if (options.requestedByUserId && existingBooking.userId !== options.requestedByUserId) {
			throw new BadRequestError("Booking does not belong to this traveller");
		}

		const cancellationNote = options.note?.trim() || undefined;
		const booking = await this.#bookingRepository.cancel(id, cancellationNote, options.cancelledBy ? cancellationSourceMap[options.cancelledBy] : undefined);
		if (!booking) throw new NotFoundError("Booking not found");

		// Ensure the necessary fields for email are present on the booking object
		if (!booking.leaderEmail || !booking.leaderName) {
			throw new Error("Booking object is missing leaderEmail or leaderName required for cancellation email.");
		}

		const firstDetail = booking.details[0];

		// Get accommodation
		const accommodation = await this.#accommodationService.getAccommodationByRoomId(firstDetail.itemId);

		// Get user using booking.leaderEmail and booking.leaderName
		const user = await this.#userService.getUserById(booking.userId);

		if (!user) {
			throw new NotFoundError(`User with id ${booking.userId} not found`);
		}

		// 4. Prepare email payload
		const userEmailData: CancellationEmailData = {
			to: user.email,
			accommodation,
			guestName: user.name,
			referenceNo: booking.referenceNo,
			roomType: firstDetail.itemType,
			nights: firstDetail.count,
			cancellationReason: cancellationNote,
			cancelledBy: options.cancelledBy === "owner" ? "the host" : options.cancelledBy === "traveller" ? "the traveller" : undefined,
		};

		const leaderEmailData: CancellationEmailData = {
			to: booking.leaderEmail,
			accommodation,
			guestName: booking.leaderName,
			referenceNo: booking.referenceNo,
			roomType: firstDetail.itemType,
			nights: firstDetail.count,
			cancellationReason: cancellationNote,
			cancelledBy: options.cancelledBy === "owner" ? "the host" : options.cancelledBy === "traveller" ? "the traveller" : undefined,
		};

		// 5. Send email
		await this.#emailService.sendCancellationEmail(userEmailData);
		if (user.email !== booking.leaderEmail) {
			await this.#emailService.sendCancellationEmail(leaderEmailData);
		}

		return { success: true };
	}

	public async getDashboardStatsByRoomIds(roomIds: string[], startOfMonth: Date) {
		const bookings = await this.#bookingRepository.getDashboardBookings(roomIds, startOfMonth);

		let revenue = 0;
		let pendingBookings = 0;
		let nightsSold = 0;

		bookings.forEach((b) => {
			if (b.status === "PENDING") {
				pendingBookings++;
			} else if (b.status === "BOOKED" || b.status === "COMPLETED") {
				revenue += Number(b.totalPrice || 0);

				const nights = Math.max(1, Math.ceil((b.endDate.getTime() - b.startDate.getTime()) / (1000 * 60 * 60 * 24)));

				// Số đêm bán được = Số đêm * Số lượng phòng
				b.details.forEach((d) => {
					if (d.itemType === "ROOM" && roomIds.includes(d.itemId)) {
						nightsSold += nights * d.count;
					}
				});
			}
		});

		return { revenue, pendingBookings, nightsSold };
	}
}
