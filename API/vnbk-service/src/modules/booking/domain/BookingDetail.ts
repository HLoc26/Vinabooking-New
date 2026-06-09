import { Entity } from "@/shared/domain/Entity";
import type { EItemType } from "@/modules/booking/enums/EItemType";

export interface BookingDetailProps {
	id: string;
	itemId: string;
	itemType: EItemType;
	count: number;
	note: string | null;
	createdAt?: Date;
	updatedAt?: Date;
}

/**
 * A single line item of a booking — a quantity of one bookable item (a ROOM or a
 * BED) for the booking's stay window. Child entity of the Booking aggregate; it
 * never persists on its own (the DAO writes it nested under its Booking).
 */
export class BookingDetail extends Entity {
	private readonly _itemId: string;
	private readonly _itemType: EItemType;
	private readonly _count: number;
	private readonly _note: string | null;
	public readonly createdAt?: Date;
	public readonly updatedAt?: Date;

	private constructor(props: BookingDetailProps) {
		super(props.id);
		this._itemId = props.itemId;
		this._itemType = props.itemType;
		this._count = props.count;
		this._note = props.note;
		this.createdAt = props.createdAt;
		this.updatedAt = props.updatedAt;
	}

	/** Create a brand-new detail line (id assigned by persistence; pass "" for new). */
	public static create(props: { id?: string; itemId: string; itemType: EItemType; count: number; note?: string | null }): BookingDetail {
		return new BookingDetail({
			id: props.id ?? "",
			itemId: props.itemId,
			itemType: props.itemType,
			count: props.count,
			note: props.note ?? null,
		});
	}

	/** Reconstitute a detail line from persistence. */
	public static rehydrate(props: BookingDetailProps): BookingDetail {
		return new BookingDetail(props);
	}

	public get itemId(): string {
		return this._itemId;
	}

	public get itemType(): EItemType {
		return this._itemType;
	}

	public get count(): number {
		return this._count;
	}

	public get note(): string | null {
		return this._note;
	}
}
