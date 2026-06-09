import { Entity } from "@/shared/domain/Entity";
import type { EBedType } from "@/modules/room/enums/EBedType";

export interface BedProps {
	id: string;
	roomId: string;
	name: string;
	description: string | null;
	bedType: EBedType;
	size: string | null;
	quantity: number;
	/** Decimal in persistence; surfaced as a JS number (or null when no rate). */
	price: number | null;
	isActive: boolean;
	createdAt?: Date;
	updatedAt?: Date;
}

/** A bed configuration within a room. */
export class Bed extends Entity {
	private readonly _roomId: string;
	private readonly _name: string;
	private readonly _description: string | null;
	private readonly _bedType: EBedType;
	private readonly _size: string | null;
	private readonly _quantity: number;
	private readonly _price: number | null;
	private readonly _isActive: boolean;
	public readonly createdAt?: Date;
	public readonly updatedAt?: Date;

	private constructor(props: BedProps) {
		super(props.id);
		this._roomId = props.roomId;
		this._name = props.name;
		this._description = props.description;
		this._bedType = props.bedType;
		this._size = props.size;
		this._quantity = props.quantity;
		this._price = props.price;
		this._isActive = props.isActive;
		this.createdAt = props.createdAt;
		this.updatedAt = props.updatedAt;
	}

	/** Reconstitute a bed from persistence. */
	public static rehydrate(props: BedProps): Bed {
		return new Bed(props);
	}

	public get roomId(): string {
		return this._roomId;
	}

	public get name(): string {
		return this._name;
	}

	public get description(): string | null {
		return this._description;
	}

	public get bedType(): EBedType {
		return this._bedType;
	}

	public get size(): string | null {
		return this._size;
	}

	public get quantity(): number {
		return this._quantity;
	}

	public get price(): number | null {
		return this._price;
	}

	public get isActive(): boolean {
		return this._isActive;
	}
}
