import BadRequestError from "@/errors/BadRequestError";
import { BookingItemType } from "./booking.enums";

export class BookingDetail {
	readonly #id: string;
	#count: number;
	#note: string | null;
	readonly #bookingId: string;
	readonly #itemId: string;
	readonly #itemType: BookingItemType;
	readonly #createdAt: Date;
	#updatedAt: Date;

	public constructor(
		id: string,
		count: number,
		note: string | null,
		bookingId: string,
		itemId: string,
		itemType: BookingItemType,
		createdAt: Date,
		updatedAt: Date
	) {
		this.#id = id;
		this.#count = count;
		this.#note = note;
		this.#bookingId = bookingId;
		this.#itemId = itemId;
		this.#itemType = itemType;
		this.#createdAt = createdAt;
		this.#updatedAt = updatedAt;

		this.validate();
	}

	private validate(): void {
		if (!this.#id) throw new BadRequestError("BookingDetail id is required");
		if (this.#count < 1) throw new BadRequestError("BookingDetail count must be at least 1");
		if (!this.#bookingId) throw new BadRequestError("BookingDetail bookingId is required");
		if (!this.#itemId) throw new BadRequestError("BookingDetail itemId is required");
		if (!this.#itemType) throw new BadRequestError("BookingDetail itemType is required");
	}

	public getId(): string { return this.#id; }
	public getCount(): number { return this.#count; }
	public getNote(): string | null { return this.#note; }
	public getBookingId(): string { return this.#bookingId; }
	public getItemId(): string { return this.#itemId; }
	public getItemType(): BookingItemType { return this.#itemType; }
	public getCreatedAt(): Date { return this.#createdAt; }
	public getUpdatedAt(): Date { return this.#updatedAt; }

	public update(count?: number, note?: string | null): void {
		let updated = false;
		if (count !== undefined && count !== this.#count) {
			if (count < 1) throw new BadRequestError("BookingDetail count must be at least 1");
			this.#count = count;
			updated = true;
		}
		if (note !== undefined && note !== this.#note) {
			this.#note = note;
			updated = true;
		}
		if (updated) {
			this.#updatedAt = new Date();
		}
	}

	public static builder(): BookingDetailBuilder {
		return new BookingDetailBuilder();
	}
}

export class BookingDetailBuilder {
	#id?: string;
	#count: number = 1;
	#note: string | null = null;
	#bookingId?: string;
	#itemId?: string;
	#itemType?: BookingItemType;
	#createdAt?: Date;
	#updatedAt?: Date;

	public setId(id: string): this { this.#id = id; return this; }
	public setCount(count: number): this { this.#count = count; return this; }
	public setNote(note: string | null): this { this.#note = note; return this; }
	public setBookingId(bookingId: string): this { this.#bookingId = bookingId; return this; }
	public setItemId(itemId: string): this { this.#itemId = itemId; return this; }
	public setItemType(itemType: BookingItemType): this { this.#itemType = itemType; return this; }
	public setCreatedAt(createdAt: Date): this { this.#createdAt = createdAt; return this; }
	public setUpdatedAt(updatedAt: Date): this { this.#updatedAt = updatedAt; return this; }

	public build(): BookingDetail {
		if (!this.#id || !this.#bookingId || !this.#itemId || !this.#itemType) {
			throw new Error("Missing required fields in BookingDetailBuilder");
		}
		const now = new Date();
		return new BookingDetail(
			this.#id,
			this.#count,
			this.#note,
			this.#bookingId,
			this.#itemId,
			this.#itemType,
			this.#createdAt || now,
			this.#updatedAt || now
		);
	}
}
