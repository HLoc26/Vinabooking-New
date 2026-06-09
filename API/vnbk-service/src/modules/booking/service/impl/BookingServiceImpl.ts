import { inject, injectable } from "tsyringe";
import type { IBookingService } from "@/modules/booking/service/IBookingService";
import { BOOKING_REPOSITORY, BOOKING_FACTORY, BOOKING_TIMEOUT_SCHEDULER } from "@/modules/booking/booking.tokens";
import type { IBookingRepository } from "@/modules/booking/repository/IBookingRepository";
import type { IBookingFactory } from "@/modules/booking/service/IBookingFactory";
import type { IBookingTimeoutScheduler } from "@/modules/booking/service/IBookingTimeoutScheduler";
import { Booking } from "@/modules/booking/domain/Booking";
import { EBookingStatus } from "@/modules/booking/enums/EBookingStatus";
import { ECancellationSource } from "@/modules/booking/enums/ECancellationSource";
import { EItemType } from "@/modules/booking/enums/EItemType";
import { BookedCountResponse } from "@/modules/booking/dto/response/BookedCountResponse";
import type { CreateBookingRequest } from "@/modules/booking/dto/request/CreateBookingRequest";
import { PRICING_SERVICE, type IPricingService, type QuoteRequest, type QuoteResponse } from "@/modules/pricing";
import { ROOM_SERVICE, type IRoomService, type RoomResponse } from "@/modules/room";
import { EVENT_PUBLISHER } from "@/infrastructure/infrastructure.tokens";
import type { IDomainEventPublisher } from "@/shared/events/IDomainEventPublisher";
import { NotFoundError } from "@/shared/error/NotFoundError";
import { ForbiddenError } from "@/shared/error/ForbiddenError";
import { ConflictError } from "@/shared/error/ConflictError";

/**
 * Thin orchestrator for the booking use-cases. Business RULES live in the Booking
 * aggregate (cancellability, the PENDING->BOOKED transition) and in the pricing
 * engine (the quote). This service only sequences: re-quote + anti-tamper hash
 * check, availability, factory build, persistence, timeout arming, and finally
 * draining + publishing the aggregate's domain events (the email side effects run
 * in cross-module handlers, never here).
 */
@injectable()
export class BookingServiceImpl implements IBookingService {
	constructor(
		@inject(BOOKING_REPOSITORY) private readonly bookingRepository: IBookingRepository,
		@inject(BOOKING_FACTORY) private readonly bookingFactory: IBookingFactory,
		@inject(BOOKING_TIMEOUT_SCHEDULER) private readonly timeoutScheduler: IBookingTimeoutScheduler,
		@inject(PRICING_SERVICE) private readonly pricingService: IPricingService,
		@inject(ROOM_SERVICE) private readonly roomService: IRoomService,
		@inject(EVENT_PUBLISHER) private readonly eventPublisher: IDomainEventPublisher
	) {}

	public async create(userId: string, request: CreateBookingRequest): Promise<Booking> {
		const quote = await this.quoteFor(request);

		// Anti-tamper: reject if the price moved since the FE was quoted.
		if (request.quoteHash !== quote.quoteHash) {
			throw new ConflictError("Price changed since the quote — please re-quote and try again", "PRICE_CHANGED");
		}

		await this.assertAvailable(request);

		const booking = this.bookingFactory.build(userId, request, quote, EBookingStatus.PENDING);
		const saved = await this.bookingRepository.create(booking);

		// NOTE: real BullMQ worker is a later phase — the scheduler only logs for now.
		await this.timeoutScheduler.schedule(saved.id);

		await this.publishEvents(saved);
		return saved;
	}

	public async createDraft(userId: string, request: CreateBookingRequest): Promise<Booking> {
		// Draft: compute the snapshot but skip the hash check (FE may not have it yet).
		const quote = await this.quoteFor(request);
		const booking = this.bookingFactory.build(userId, request, quote, EBookingStatus.DRAFT);
		const saved = await this.bookingRepository.create(booking);
		await this.publishEvents(saved);
		return saved;
	}

	public async confirm(userId: string, bookingId: string): Promise<Booking> {
		const booking = await this.load(bookingId);
		if (!booking.belongsTo(userId)) {
			throw new ForbiddenError("Booking does not belong to this user");
		}

		booking.confirm(); // domain owns the PENDING -> BOOKED rule + records the event

		const saved = await this.bookingRepository.update(booking);

		// NOTE: real BullMQ worker is a later phase — removing the timeout only logs for now.
		await this.timeoutScheduler.cancel(bookingId);

		// The mutator recorded the event on the loaded aggregate; drain it (post-persistence).
		await this.publishEvents(booking);
		return saved;
	}

	public async cancel(userId: string, bookingId: string, note?: string): Promise<Booking> {
		const booking = await this.load(bookingId);
		if (!booking.belongsTo(userId)) {
			throw new ForbiddenError("Booking does not belong to this traveller");
		}

		booking.cancel(ECancellationSource.TRAVELLER, note); // domain owns the cancellability rule + records the event

		const saved = await this.bookingRepository.update(booking);

		// The mutator recorded the event on the loaded aggregate; drain it (post-persistence).
		await this.publishEvents(booking);
		return saved;
	}

	public async getBookedCounts(roomIds: string[], startDate: Date, endDate: Date): Promise<BookedCountResponse[]> {
		const counts = await this.bookingRepository.countBookedRooms(roomIds, startDate, endDate);
		return roomIds.map((roomId) => {
			const response = new BookedCountResponse();
			response.roomId = roomId;
			response.bookedCount = counts[roomId] ?? 0;
			return response;
		});
	}

	// ---------- helpers ----------

	private async load(bookingId: string): Promise<Booking> {
		const booking = await this.bookingRepository.findById(bookingId);
		if (!booking) throw new NotFoundError(`Booking with id ${bookingId} not found`);
		return booking;
	}

	private async quoteFor(request: CreateBookingRequest): Promise<QuoteResponse> {
		const quoteRequest: QuoteRequest = {
			checkIn: request.startDate,
			checkOut: request.endDate,
			bookedAt: request.bookedAt,
			items: request.details.create.map((d) => ({
				itemType: d.itemType,
				itemId: d.itemId,
				count: d.count,
			})),
		};
		return this.pricingService.quote(quoteRequest);
	}

	/**
	 * Availability check used by create: this module's DAO counts overlapping
	 * PENDING/BOOKED units from its OWN Booking/BookingDetail tables, while the
	 * total capacity (room quantity + per-bed quantity) is read from the room
	 * module's service — so booking never touches the rooms/beds tables.
	 */
	private async assertAvailable(request: CreateBookingRequest): Promise<void> {
		const items = request.details.create;
		const itemIds = items.map((i) => i.itemId);
		const roomIds = items.filter((i) => i.itemType === EItemType.ROOM).map((i) => i.itemId);

		const startDate = new Date(request.startDate);
		const endDate = new Date(request.endDate);

		const [bookedCounts, capacity] = await Promise.all([
			this.bookingRepository.countOverlappingBookedItems(itemIds, startDate, endDate),
			this.loadCapacity(roomIds),
		]);

		for (const item of items) {
			const alreadyBooked = bookedCounts[item.itemId] ?? 0;
			const totalQuantity = capacity.get(item.itemId) ?? 0;
			if (alreadyBooked + item.count > totalQuantity) {
				throw new ConflictError(`Item ${item.itemId} is not available for the selected dates`, "NOT_AVAILABLE");
			}
		}
	}

	/** Build an itemId -> total-quantity map for the requested rooms AND their beds, via the room service. */
	private async loadCapacity(roomIds: string[]): Promise<Map<string, number>> {
		const capacity = new Map<string, number>();
		if (roomIds.length === 0) return capacity;

		const rooms: RoomResponse[] = await this.roomService.getRoomsByMultipleIds(roomIds);
		for (const room of rooms) {
			capacity.set(room.id, room.quantity);
			for (const bed of room.beds) {
				capacity.set(bed.id, bed.quantity);
			}
		}
		return capacity;
	}

	/** Drain the aggregate's recorded events and publish each (post-persistence). */
	private async publishEvents(aggregate: Booking): Promise<void> {
		const events = aggregate.pullDomainEvents();
		for (const event of events) {
			await this.eventPublisher.publish(event);
		}
	}
}
