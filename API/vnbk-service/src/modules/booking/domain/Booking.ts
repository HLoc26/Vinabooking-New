import { AggregateRoot } from "@/shared/domain/AggregateRoot";
import { BadRequestError } from "@/shared/error/BadRequestError";
import { ConflictError } from "@/shared/error/ConflictError";
import { EBookingStatus } from "@/modules/booking/enums/EBookingStatus";
import type { ECancellationSource } from "@/modules/booking/enums/ECancellationSource";
import type { BookingDetail } from "@/modules/booking/domain/BookingDetail";
import type { PricingSnapshot } from "@/modules/booking/domain/PricingSnapshot";
import { BookingConfirmedEvent } from "@/modules/booking/events/BookingConfirmedEvent";
import { BookingCancelledEvent } from "@/modules/booking/events/BookingCancelledEvent";

const MS_PER_DAY = 1000 * 60 * 60 * 24;

export interface BookingProps {
	id: string;
	status: EBookingStatus;
	startDate: Date;
	endDate: Date;
	guestCount: number;
	leaderName: string | null;
	leaderEmail: string | null;
	phone: string | null;
	totalPrice: number | null;
	pricingSnapshot: PricingSnapshot | null;
	referenceNo: number;
	note: string | null;
	noteBy: ECancellationSource | null;
	userId: string;
	details: BookingDetail[];
	createdAt?: Date;
	updatedAt?: Date;
}

/**
 * The Booking aggregate root — the consistency boundary over a reservation plus
 * its detail lines. It OWNS the lifecycle rules that were previously inline in
 * the monolith's booking service: only PENDING/BOOKED bookings are cancellable,
 * and a confirmation is the single PENDING -> BOOKED transition. Mutators enforce
 * those rules (throwing AppErrors) and record a domain event; the thin service
 * persists the aggregate, then drains + publishes the events.
 */
export class Booking extends AggregateRoot {
	private _status: EBookingStatus;
	private readonly _startDate: Date;
	private readonly _endDate: Date;
	private readonly _guestCount: number;
	private readonly _leaderName: string | null;
	private readonly _leaderEmail: string | null;
	private readonly _phone: string | null;
	private readonly _totalPrice: number | null;
	private readonly _pricingSnapshot: PricingSnapshot | null;
	private readonly _referenceNo: number;
	private _note: string | null;
	private _noteBy: ECancellationSource | null;
	private readonly _userId: string;
	private readonly _details: BookingDetail[];
	public readonly createdAt?: Date;
	public readonly updatedAt?: Date;

	private constructor(props: BookingProps) {
		super(props.id);
		this._status = props.status;
		this._startDate = props.startDate;
		this._endDate = props.endDate;
		this._guestCount = props.guestCount;
		this._leaderName = props.leaderName;
		this._leaderEmail = props.leaderEmail;
		this._phone = props.phone;
		this._totalPrice = props.totalPrice;
		this._pricingSnapshot = props.pricingSnapshot;
		this._referenceNo = props.referenceNo;
		this._note = props.note;
		this._noteBy = props.noteBy;
		this._userId = props.userId;
		this._details = props.details;
		this.createdAt = props.createdAt;
		this.updatedAt = props.updatedAt;
	}

	/** Create a brand-new booking (id assigned by persistence; pass "" for new). Enforces structural invariants. */
	public static create(props: Omit<BookingProps, "id"> & { id?: string }): Booking {
		if (props.endDate.getTime() <= props.startDate.getTime()) {
			throw new BadRequestError("Booking end date must be after start date");
		}
		if (props.details.length === 0) {
			throw new BadRequestError("A booking must contain at least one item");
		}
		if (props.guestCount < 1) {
			throw new BadRequestError("Booking guest count must be at least 1");
		}
		return new Booking({ ...props, id: props.id ?? "" });
	}

	/** Reconstitute a booking (with its detail lines) from persistence (no invariant re-check). */
	public static rehydrate(props: BookingProps): Booking {
		return new Booking(props);
	}

	public get status(): EBookingStatus {
		return this._status;
	}

	public get startDate(): Date {
		return this._startDate;
	}

	public get endDate(): Date {
		return this._endDate;
	}

	public get guestCount(): number {
		return this._guestCount;
	}

	public get leaderName(): string | null {
		return this._leaderName;
	}

	public get leaderEmail(): string | null {
		return this._leaderEmail;
	}

	public get phone(): string | null {
		return this._phone;
	}

	public get totalPrice(): number | null {
		return this._totalPrice;
	}

	public get pricingSnapshot(): PricingSnapshot | null {
		return this._pricingSnapshot;
	}

	public get referenceNo(): number {
		return this._referenceNo;
	}

	public get note(): string | null {
		return this._note;
	}

	public get noteBy(): ECancellationSource | null {
		return this._noteBy;
	}

	public get userId(): string {
		return this._userId;
	}

	public get details(): readonly BookingDetail[] {
		return this._details;
	}

	/** The number of nights in the stay window (always ≥ 1, mirroring the monolith). */
	public nights(): number {
		return Math.max(1, Math.ceil((this._endDate.getTime() - this._startDate.getTime()) / MS_PER_DAY));
	}

	/** True when this booking was made by the given traveller. */
	public belongsTo(userId: string): boolean {
		return this._userId === userId;
	}

	/** Only PENDING or BOOKED bookings can be cancelled (DRAFT/CANCELLED/COMPLETED cannot). */
	public isCancellable(): boolean {
		return this._status === EBookingStatus.PENDING || this._status === EBookingStatus.BOOKED;
	}

	/**
	 * Cancel the booking. Enforces the cancellability rule, stamps the note + its
	 * source, flips the status to CANCELLED, and records a BookingCancelledEvent
	 * for the cross-module cancellation email.
	 */
	public cancel(source?: ECancellationSource, note?: string): void {
		if (this._status === EBookingStatus.CANCELLED) {
			throw new ConflictError("Booking is already cancelled", "ALREADY_CANCELLED");
		}
		if (!this.isCancellable()) {
			throw new BadRequestError("Only pending or booked bookings can be cancelled");
		}
		const trimmed = note?.trim() || null;
		this._status = EBookingStatus.CANCELLED;
		this._note = trimmed;
		this._noteBy = source ?? null;
		this.addDomainEvent(this.toCancelledEvent(source ?? null, trimmed));
	}

	/**
	 * Confirm the booking: the single PENDING -> BOOKED transition. Throws if the
	 * booking is not currently PENDING, then records a BookingConfirmedEvent for
	 * the cross-module confirmation email.
	 */
	public confirm(): void {
		if (this._status !== EBookingStatus.PENDING) {
			throw new ConflictError("Only a pending booking can be confirmed", "NOT_PENDING");
		}
		this._status = EBookingStatus.BOOKED;
		this.addDomainEvent(this.toConfirmedEvent());
	}

	private firstDetail(): BookingDetail {
		const detail = this._details[0];
		if (!detail) {
			throw new BadRequestError("Booking has no detail lines");
		}
		return detail;
	}

	private toConfirmedEvent(): BookingConfirmedEvent {
		const first = this.firstDetail();
		return new BookingConfirmedEvent(
			this.id,
			this._userId,
			this._referenceNo,
			first.itemId,
			first.itemType,
			this._leaderName,
			this._leaderEmail,
			this._startDate,
			this._endDate,
			this._guestCount,
			this.nights(),
			first.note,
			this._totalPrice
		);
	}

	private toCancelledEvent(source: ECancellationSource | null, note: string | null): BookingCancelledEvent {
		const first = this.firstDetail();
		return new BookingCancelledEvent(this.id, this._userId, this._referenceNo, first.itemId, first.itemType, this._leaderName, this._leaderEmail, this.nights(), source, note);
	}
}
