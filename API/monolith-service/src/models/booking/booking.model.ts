import BadRequestError from "@/errors/BadRequestError";
import { BookingDetail } from "./booking-detail.model";
import { BookingStatus, CancellationSource } from "./booking.enums";

// Minimal interface for PricingSnapshot structure. Can be expanded based on exact shape.
export interface PricingSnapshot {
	[key: string]: any;
}

export class Booking {
	readonly #id: string;
	#startDate: Date;
	#endDate: Date;
	#guestCount: number;
	#leaderName: string | null;
	#leaderEmail: string | null;
	#totalPrice: number | null;
	#pricingSnapshot: PricingSnapshot | null;
	#phone: string | null;
	#referenceNo: number;
	#status: BookingStatus;
	#note: string | null;
	#noteBy: CancellationSource | null;
	readonly #userId: string;
	readonly #createdAt: Date;
	#updatedAt: Date;
	#details: BookingDetail[];

	public constructor(
		id: string,
		startDate: Date,
		endDate: Date,
		guestCount: number,
		leaderName: string | null,
		leaderEmail: string | null,
		totalPrice: number | null,
		pricingSnapshot: PricingSnapshot | null,
		phone: string | null,
		referenceNo: number,
		status: BookingStatus,
		note: string | null,
		noteBy: CancellationSource | null,
		userId: string,
		createdAt: Date,
		updatedAt: Date,
		details: BookingDetail[]
	) {
		this.#id = id;
		this.#startDate = startDate;
		this.#endDate = endDate;
		this.#guestCount = guestCount;
		this.#leaderName = leaderName;
		this.#leaderEmail = leaderEmail;
		this.#totalPrice = totalPrice;
		this.#pricingSnapshot = pricingSnapshot;
		this.#phone = phone;
		this.#referenceNo = referenceNo;
		this.#status = status;
		this.#note = note;
		this.#noteBy = noteBy;
		this.#userId = userId;
		this.#createdAt = createdAt;
		this.#updatedAt = updatedAt;
		this.#details = details;

		this.validate();
	}

	private validate(): void {
		if (!this.#id) throw new BadRequestError("Booking id is required");
		if (!this.#userId) throw new BadRequestError("Booking userId is required");
		if (this.#startDate >= this.#endDate) throw new BadRequestError("Booking startDate must be before endDate");
		if (this.#guestCount < 1) throw new BadRequestError("Booking guestCount must be at least 1");
	}

	public getId(): string { return this.#id; }
	public getStartDate(): Date { return this.#startDate; }
	public getEndDate(): Date { return this.#endDate; }
	public getGuestCount(): number { return this.#guestCount; }
	public getLeaderName(): string | null { return this.#leaderName; }
	public getLeaderEmail(): string | null { return this.#leaderEmail; }
	public getTotalPrice(): number | null { return this.#totalPrice; }
	public getPricingSnapshot(): PricingSnapshot | null { return this.#pricingSnapshot ? { ...this.#pricingSnapshot } : null; }
	public getPhone(): string | null { return this.#phone; }
	public getReferenceNo(): number { return this.#referenceNo; }
	public getStatus(): BookingStatus { return this.#status; }
	public getNote(): string | null { return this.#note; }
	public getNoteBy(): CancellationSource | null { return this.#noteBy; }
	public getUserId(): string { return this.#userId; }
	public getCreatedAt(): Date { return this.#createdAt; }
	public getUpdatedAt(): Date { return this.#updatedAt; }
	public getDetails(): BookingDetail[] { return [...this.#details]; }

	// Domain Logic for Status Transitions
	public markAsPending(): void {
		if (this.#status !== BookingStatus.DRAFT) {
			throw new BadRequestError(`Cannot transition from ${this.#status} to PENDING`);
		}
		this.#status = BookingStatus.PENDING;
		this.#updatedAt = new Date();
	}

	public markAsBooked(pricingSnapshot: PricingSnapshot, totalPrice: number): void {
		if (this.#status !== BookingStatus.PENDING) {
			throw new BadRequestError(`Cannot transition from ${this.#status} to BOOKED`);
		}
		this.#status = BookingStatus.BOOKED;
		this.#pricingSnapshot = pricingSnapshot;
		this.#totalPrice = totalPrice;
		this.#updatedAt = new Date();
	}

	public markAsCompleted(): void {
		if (this.#status !== BookingStatus.BOOKED) {
			throw new BadRequestError(`Cannot transition from ${this.#status} to COMPLETED`);
		}
		this.#status = BookingStatus.COMPLETED;
		this.#updatedAt = new Date();
	}

	public cancel(source: CancellationSource, note?: string): void {
		if (this.#status === BookingStatus.COMPLETED || this.#status === BookingStatus.CANCELLED) {
			throw new BadRequestError(`Cannot cancel booking in ${this.#status} state`);
		}
		this.#status = BookingStatus.CANCELLED;
		this.#noteBy = source;
		if (note !== undefined) {
			this.#note = note;
		}
		this.#updatedAt = new Date();
	}

	public updateDetails(details: BookingDetail[]): void {
		if (this.#status !== BookingStatus.DRAFT) {
			throw new BadRequestError("Can only modify items when booking is in DRAFT state");
		}
		this.#details = details;
		this.#updatedAt = new Date();
	}

	public updateInfo(guestCount: number, leaderName: string | null, leaderEmail: string | null, phone: string | null): void {
		this.#guestCount = guestCount;
		this.#leaderName = leaderName;
		this.#leaderEmail = leaderEmail;
		this.#phone = phone;
		this.#updatedAt = new Date();
	}

	public static builder(): BookingBuilder {
		return new BookingBuilder();
	}
}

export class BookingBuilder {
	#id?: string;
	#startDate?: Date;
	#endDate?: Date;
	#guestCount: number = 1;
	#leaderName: string | null = null;
	#leaderEmail: string | null = null;
	#totalPrice: number | null = null;
	#pricingSnapshot: PricingSnapshot | null = null;
	#phone: string | null = null;
	#referenceNo?: number;
	#status: BookingStatus = BookingStatus.DRAFT;
	#note: string | null = null;
	#noteBy: CancellationSource | null = null;
	#userId?: string;
	#createdAt?: Date;
	#updatedAt?: Date;
	#details: BookingDetail[] = [];

	public setId(id: string): this { this.#id = id; return this; }
	public setDates(startDate: Date, endDate: Date): this { this.#startDate = startDate; this.#endDate = endDate; return this; }
	public setGuestCount(guestCount: number): this { this.#guestCount = guestCount; return this; }
	public setContactInfo(leaderName: string | null, leaderEmail: string | null, phone: string | null): this { 
		this.#leaderName = leaderName; 
		this.#leaderEmail = leaderEmail; 
		this.#phone = phone; 
		return this; 
	}
	public setPricing(totalPrice: number | null, pricingSnapshot: PricingSnapshot | null): this { 
		this.#totalPrice = totalPrice; 
		this.#pricingSnapshot = pricingSnapshot; 
		return this; 
	}
	public setReferenceNo(referenceNo: number): this { this.#referenceNo = referenceNo; return this; }
	public setStatus(status: BookingStatus): this { this.#status = status; return this; }
	public setCancellationInfo(note: string | null, noteBy: CancellationSource | null): this { 
		this.#note = note; 
		this.#noteBy = noteBy; 
		return this; 
	}
	public setUserId(userId: string): this { this.#userId = userId; return this; }
	public setCreatedAt(createdAt: Date): this { this.#createdAt = createdAt; return this; }
	public setUpdatedAt(updatedAt: Date): this { this.#updatedAt = updatedAt; return this; }
	public setDetails(details: BookingDetail[]): this { this.#details = details; return this; }

	public build(): Booking {
		if (!this.#id || !this.#startDate || !this.#endDate || this.#referenceNo === undefined || !this.#userId) {
			throw new Error("Missing required fields in BookingBuilder");
		}
		const now = new Date();
		return new Booking(
			this.#id,
			this.#startDate,
			this.#endDate,
			this.#guestCount,
			this.#leaderName,
			this.#leaderEmail,
			this.#totalPrice,
			this.#pricingSnapshot,
			this.#phone,
			this.#referenceNo,
			this.#status,
			this.#note,
			this.#noteBy,
			this.#userId,
			this.#createdAt || now,
			this.#updatedAt || now,
			this.#details
		);
	}
}
