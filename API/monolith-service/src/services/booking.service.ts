import { bookingTimeoutQueue } from "@/clients/queue.client";
import { BOOKING_TIMEOUT_MS } from "@/constants/booking";
import { BookingPayload } from "@/dto/request/booking.dto";
import { BadRequestError, ConflictError, NotFoundError } from "@/errors";
import { Booking, BookingDetail, BookingItemType, BookingStatus, CancellationSource, PricingSnapshot } from "@/models/booking";
import { BookingRepository, OwnerBookingFilters, RoomRepository } from "@/repositories";
import { CancellationEmailData, ConfirmationEmailData } from "@/types/email.types";
import type { QuoteRequest, QuoteResponse } from "@/types/pricing.types";
import { v4 as uuidv4 } from "uuid";
import AccommodationService from "./accommodation.service";
import EmailService from "./email.service";
import PricingService from "./pricing.service";
import UserService from "./user.service";

type CancelBookingActor = "owner" | "traveller" | "system";

type CancelBookingOptions = {
	note?: string;
	cancelledBy?: CancelBookingActor;
	requestedByUserId?: string;
};

const cancellationSourceMap: Record<CancelBookingActor, CancellationSource> = {
	owner: CancellationSource.OWNER,
	traveller: CancellationSource.TRAVELLER,
	system: CancellationSource.SYSTEM,
};

export default class BookingService {
	readonly #bookingRepository: BookingRepository;
	readonly #roomRepository: RoomRepository;
	readonly #userService: UserService;
	readonly #emailService: EmailService;
	readonly #accommodationService: AccommodationService;
	readonly #pricingService: PricingService;

	constructor(
		bookingRepository: BookingRepository, 
		roomRepository: RoomRepository, 
		userService: UserService, 
		emailService: EmailService,
		accommodationService: AccommodationService,
		pricingService: PricingService
	) {
		this.#bookingRepository = bookingRepository;
		this.#roomRepository = roomRepository;
		this.#userService = userService;
		this.#emailService = emailService;
		this.#accommodationService = accommodationService;
		this.#pricingService = pricingService;
	}

	private async _quoteForBooking(data: BookingPayload): Promise<QuoteResponse> {
		const req: QuoteRequest = {
			checkIn: new Date(data.startDate),
			checkOut: new Date(data.endDate),
			bookedAt: data.bookedAt ? new Date(data.bookedAt) : undefined,
			items: data.details.create.map((d) => ({
				itemType: d.itemType,
				itemId: d.itemId,
				count: d.count,
			})),
		};
		return await this.#pricingService.quote(req);
	}

	public async getBookingById(id: string) {
		const booking = await this.#bookingRepository.findById(id);
		if (!booking) throw new NotFoundError(`Booking with id ${id} not found`);
		return booking;
	}

	public async getBookingsByAccommodationId(accommId: string) {
		const bookings = await this.#bookingRepository.findByAccommodationId(accommId);
		if (!bookings || bookings.length === 0) throw new NotFoundError(`No bookings found for user ${accommId}`);
		return bookings;
	}

	public async getBookingsByUserId(userId: string) {
		const bookings = await this.#bookingRepository.findByUserId(userId);
		return bookings || [];
	}

	public async getBookingsByRoomId(roomId: string) {
		const bookings = await this.#bookingRepository.findByRoomId(roomId);
		if (!bookings || bookings.length === 0) throw new NotFoundError(`No bookings found for room ${roomId}`);
		return bookings;
	}

	public async getOwnerBookings(ownerId: string, filters: OwnerBookingFilters) {
		const { bookings, itemMap } = await this.#bookingRepository.findOwnerBookings(ownerId, filters);

		return bookings.map(({ booking, user, paymentTransfers }) => {
			const nights = Math.max(1, Math.ceil((booking.getEndDate().getTime() - booking.getStartDate().getTime()) / (1000 * 60 * 60 * 24)));
			const details = booking.getDetails();
			const items = details.map((detail) => {
				const meta = itemMap[detail.getItemId()];
				return {
					id: detail.getItemId(),
					type: detail.getItemType(),
					name: meta?.name ?? detail.getItemType(),
					count: detail.getCount(),
					note: detail.getNote(),
				};
			});
			const firstMeta = details.map((detail) => itemMap[detail.getItemId()]).find(Boolean);
			const latestPayment = paymentTransfers[0] ?? null;

			return {
				id: booking.getId(),
				referenceNo: booking.getReferenceNo(),
				status: booking.getStatus(),
				startDate: booking.getStartDate(),
				endDate: booking.getEndDate(),
				guestCount: booking.getGuestCount(),
				nights,
				totalPrice: booking.getTotalPrice()?.toString() ?? null,
				phone: booking.getPhone(),
				leaderName: booking.getLeaderName(),
				leaderEmail: booking.getLeaderEmail(),
				note: booking.getNote(),
				noteBy: booking.getNoteBy(),
				createdAt: booking.getCreatedAt(),
				updatedAt: booking.getUpdatedAt(),
				paymentStatus: latestPayment?.status ?? null,
				guest: {
					id: user.id,
					name: user.name,
					email: user.email,
					phone: user.phone,
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

		if (booking.getStatus() !== BookingStatus.PENDING && booking.getStatus() !== BookingStatus.BOOKED) {
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

		const snapshot: PricingSnapshot = {
			...quote,
			checkIn: new Date(data.startDate).toISOString(),
			checkOut: new Date(data.endDate).toISOString(),
			bookedAt: data.bookedAt,
		};

		const bookingId = uuidv4();

		const domainDetails = data.details.create.map(d => 
			BookingDetail.builder()
				.setId(uuidv4())
				.setCount(d.count)
				.setNote(d.note || null)
				.setBookingId(bookingId)
				.setItemId(d.itemId)
				.setItemType(d.itemType as unknown as BookingItemType)
				.build()
		);

		const domainBooking = Booking.builder()
			.setId(bookingId)
			.setDates(new Date(data.startDate), new Date(data.endDate))
			.setGuestCount(data.guestCount)
			.setContactInfo(data.leaderName || null, data.leaderEmail || null, data.phone || null)
			.setPricing(quote.totals.payablePrice, snapshot)
			.setReferenceNo(Number((Date.now() % 1e7) * 100 + Math.floor(Math.random() * 100)))
			.setStatus(BookingStatus.PENDING)
			.setUserId(userId)
			.setDetails(domainDetails)
			.build();

		const newBooking = await this.#bookingRepository.create(domainBooking);
		await bookingTimeoutQueue.add("timeout", { bookingId: newBooking.getId() }, { delay: BOOKING_TIMEOUT_MS, jobId: newBooking.getId() });
		return newBooking;
	}

	public async createDraftBooking(userId: string, data: BookingPayload) {
		const quote = await this._quoteForBooking(data);
		const snapshot: PricingSnapshot = {
			...quote,
			checkIn: new Date(data.startDate).toISOString(),
			checkOut: new Date(data.endDate).toISOString(),
			bookedAt: data.bookedAt,
		};

		const bookingId = uuidv4();

		const domainDetails = data.details.create.map(d => 
			BookingDetail.builder()
				.setId(uuidv4())
				.setCount(d.count)
				.setNote(d.note || null)
				.setBookingId(bookingId)
				.setItemId(d.itemId)
				.setItemType(d.itemType as unknown as BookingItemType)
				.build()
		);

		const domainBooking = Booking.builder()
			.setId(bookingId)
			.setDates(new Date(data.startDate), new Date(data.endDate))
			.setGuestCount(data.guestCount)
			.setContactInfo(data.leaderName || null, data.leaderEmail || null, data.phone || null)
			.setPricing(quote.totals.payablePrice, snapshot)
			.setReferenceNo(Number((Date.now() % 1e7) * 100 + Math.floor(Math.random() * 100)))
			.setStatus(BookingStatus.DRAFT)
			.setUserId(userId)
			.setDetails(domainDetails)
			.build();

		return await this.#bookingRepository.create(domainBooking);
	}

	public async confirmBooking(id: string) {
		await bookingTimeoutQueue.remove(id);

		const booking = await this.#bookingRepository.findById(id);
		if (!booking) throw new NotFoundError("Booking not found");

		// Encapsulated state transition
		if (booking.getStatus() === BookingStatus.DRAFT) {
			booking.markAsPending();
		}
		booking.markAsBooked(booking.getPricingSnapshot()!, booking.getTotalPrice()!);

		const updatedBooking = await this.#bookingRepository.update(booking);
		console.log(`[BookingService] Booking confirmed: ${updatedBooking.getId()}`);

		const leaderEmail = updatedBooking.getLeaderEmail();
		const leaderName = updatedBooking.getLeaderName();
		if (!leaderEmail || !leaderName) {
			throw new Error("Booking object is missing leaderEmail or leaderName required for confirmation email.");
		}

		const firstDetail = updatedBooking.getDetails()[0];
		const accommodation = await this.#accommodationService.getAccommodationByRoomId(firstDetail.getItemId());
		const user = await this.#userService.getUserById(updatedBooking.getUserId());

		if (!user) {
			throw new NotFoundError(`User with id ${updatedBooking.getUserId()} not found`);
		}

		const checkIn = updatedBooking.getStartDate().toLocaleDateString("en-US", {
			weekday: "long", year: "numeric", month: "long", day: "numeric",
		});

		const checkOut = updatedBooking.getEndDate().toLocaleDateString("en-US", {
			weekday: "long", year: "numeric", month: "long", day: "numeric",
		});
		
		const totalChargeDisplay = updatedBooking.getTotalPrice() ? updatedBooking.getTotalPrice()!.toString() : undefined;

		const userEmailData: ConfirmationEmailData = {
			to: user.email,
			accommodation,
			checkIn,
			checkOut,
			guestName: user.name,
			referenceNo: updatedBooking.getReferenceNo(),
			roomType: firstDetail.getItemType(),
			guestCount: updatedBooking.getGuestCount(),
			nights: firstDetail.getCount(),
			specialRequest: firstDetail.getNote() || undefined,
			totalCharge: totalChargeDisplay,
		};

		const leaderEmailData: ConfirmationEmailData = {
			to: leaderEmail,
			accommodation,
			checkIn,
			checkOut,
			guestName: leaderName,
			referenceNo: updatedBooking.getReferenceNo(),
			roomType: firstDetail.getItemType(),
			guestCount: updatedBooking.getGuestCount(),
			nights: firstDetail.getCount(),
			specialRequest: firstDetail.getNote() || undefined,
			totalCharge: totalChargeDisplay,
		};

		await this.#emailService.sendConfirmationEmail(userEmailData);
		if (user.email !== leaderEmail) {
			await this.#emailService.sendConfirmationEmail(leaderEmailData);
		}

		return updatedBooking;
	}

	public async cancelBooking(id: string, options: CancelBookingOptions = {}) {
		const booking = await this.#bookingRepository.findById(id);
		if (!booking) throw new NotFoundError("Booking not found");

		if (options.requestedByUserId && booking.getUserId() !== options.requestedByUserId) {
			throw new BadRequestError("Booking does not belong to this traveller");
		}

		const cancellationNote = options.note?.trim() || undefined;
		const cancellationSource = options.cancelledBy ? cancellationSourceMap[options.cancelledBy] : CancellationSource.SYSTEM;
		
		// Encapsulated state transition
		booking.cancel(cancellationSource, cancellationNote);

		const updatedBooking = await this.#bookingRepository.cancelWithTransaction(booking);

		const leaderEmail = updatedBooking.getLeaderEmail();
		const leaderName = updatedBooking.getLeaderName();
		if (!leaderEmail || !leaderName) {
			throw new Error("Booking object is missing leaderEmail or leaderName required for cancellation email.");
		}

		const firstDetail = updatedBooking.getDetails()[0];
		const accommodation = await this.#accommodationService.getAccommodationByRoomId(firstDetail.getItemId());
		const user = await this.#userService.getUserById(updatedBooking.getUserId());

		if (!user) {
			throw new NotFoundError(`User with id ${updatedBooking.getUserId()} not found`);
		}

		const userEmailData: CancellationEmailData = {
			to: user.email,
			accommodation,
			guestName: user.name,
			referenceNo: updatedBooking.getReferenceNo(),
			roomType: firstDetail.getItemType(),
			nights: firstDetail.getCount(),
			cancellationReason: cancellationNote,
			cancelledBy: options.cancelledBy === "owner" ? "the host" : options.cancelledBy === "traveller" ? "the traveller" : undefined,
		};

		const leaderEmailData: CancellationEmailData = {
			to: leaderEmail,
			accommodation,
			guestName: leaderName,
			referenceNo: updatedBooking.getReferenceNo(),
			roomType: firstDetail.getItemType(),
			nights: firstDetail.getCount(),
			cancellationReason: cancellationNote,
			cancelledBy: options.cancelledBy === "owner" ? "the host" : options.cancelledBy === "traveller" ? "the traveller" : undefined,
		};

		await this.#emailService.sendCancellationEmail(userEmailData);
		if (user.email !== leaderEmail) {
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
			if (b.getStatus() === BookingStatus.PENDING) {
				pendingBookings++;
			} else if (b.getStatus() === BookingStatus.BOOKED || b.getStatus() === BookingStatus.COMPLETED) {
				revenue += Number(b.getTotalPrice() || 0);

				const nights = Math.max(1, Math.ceil((b.getEndDate().getTime() - b.getStartDate().getTime()) / (1000 * 60 * 60 * 24)));

				b.getDetails().forEach((d) => {
					if (d.getItemType() === BookingItemType.ROOM && roomIds.includes(d.getItemId())) {
						nightsSold += nights * d.getCount();
					}
				});
			}
		});

		return { revenue, pendingBookings, nightsSold };
	}
}
