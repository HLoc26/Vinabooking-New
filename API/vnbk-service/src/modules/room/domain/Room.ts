import { AggregateRoot } from "@/shared/domain/AggregateRoot";
import type { Bed } from "@/modules/room/domain/Bed";
import type { AmenityConfig } from "@/modules/room/domain/AmenityConfig";
import type { EViewType } from "@/modules/room/enums/EViewType";
import type { EPricingType } from "@/modules/room/enums/EPricingType";

export interface RoomProps {
	id: string;
	accommodationId: string;
	name: string;
	description: string | null;
	quantity: number;
	maxAdults: number;
	maxChildren: number;
	/** Decimal in persistence (m²); surfaced as a JS number (or null). */
	size: number | null;
	bedroomCount: number;
	bathroomCount: number;
	viewType: EViewType;
	viewDescription: string | null;
	/** Decimal in persistence; surfaced as a JS number. */
	basePrice: number;
	/** Decimal in persistence; surfaced as a JS number. */
	floorPrice: number;
	pricingType: EPricingType;
	isActive: boolean;
	createdAt?: Date;
	updatedAt?: Date;
	beds?: Bed[];
	amenities?: AmenityConfig[];
}

/**
 * The Room aggregate root — the consistency boundary over a room plus its beds
 * and amenity configs. The DAO loads/persists the whole graph; mutation rules
 * (e.g. "at least one bed", "floorPrice ≤ basePrice") live here.
 *
 * NOTE: availability / remaining-quantity (booked-count subtraction) is NOT a
 * room concern — it lives in the booking module, which depends on room.
 */
export class Room extends AggregateRoot {
	private readonly _accommodationId: string;
	private readonly _name: string;
	private readonly _description: string | null;
	private readonly _quantity: number;
	private readonly _maxAdults: number;
	private readonly _maxChildren: number;
	private readonly _size: number | null;
	private readonly _bedroomCount: number;
	private readonly _bathroomCount: number;
	private readonly _viewType: EViewType;
	private readonly _viewDescription: string | null;
	private readonly _basePrice: number;
	private readonly _floorPrice: number;
	private readonly _pricingType: EPricingType;
	private readonly _isActive: boolean;
	public readonly createdAt?: Date;
	public readonly updatedAt?: Date;
	private readonly _beds: Bed[];
	private readonly _amenities: AmenityConfig[];

	private constructor(props: RoomProps) {
		super(props.id);
		this._accommodationId = props.accommodationId;
		this._name = props.name;
		this._description = props.description;
		this._quantity = props.quantity;
		this._maxAdults = props.maxAdults;
		this._maxChildren = props.maxChildren;
		this._size = props.size;
		this._bedroomCount = props.bedroomCount;
		this._bathroomCount = props.bathroomCount;
		this._viewType = props.viewType;
		this._viewDescription = props.viewDescription;
		this._basePrice = props.basePrice;
		this._floorPrice = props.floorPrice;
		this._pricingType = props.pricingType;
		this._isActive = props.isActive;
		this.createdAt = props.createdAt;
		this.updatedAt = props.updatedAt;
		this._beds = props.beds ?? [];
		this._amenities = props.amenities ?? [];
	}

	/** Reconstitute a room (with its beds + amenity configs) from persistence. */
	public static rehydrate(props: RoomProps): Room {
		return new Room(props);
	}

	public get accommodationId(): string {
		return this._accommodationId;
	}

	public get name(): string {
		return this._name;
	}

	public get description(): string | null {
		return this._description;
	}

	public get quantity(): number {
		return this._quantity;
	}

	public get maxAdults(): number {
		return this._maxAdults;
	}

	public get maxChildren(): number {
		return this._maxChildren;
	}

	public get size(): number | null {
		return this._size;
	}

	public get bedroomCount(): number {
		return this._bedroomCount;
	}

	public get bathroomCount(): number {
		return this._bathroomCount;
	}

	public get viewType(): EViewType {
		return this._viewType;
	}

	public get viewDescription(): string | null {
		return this._viewDescription;
	}

	public get basePrice(): number {
		return this._basePrice;
	}

	public get floorPrice(): number {
		return this._floorPrice;
	}

	public get pricingType(): EPricingType {
		return this._pricingType;
	}

	public get isActive(): boolean {
		return this._isActive;
	}

	public get beds(): readonly Bed[] {
		return this._beds;
	}

	public get amenities(): readonly AmenityConfig[] {
		return this._amenities;
	}
}
