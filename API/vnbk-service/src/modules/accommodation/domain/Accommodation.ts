import { AggregateRoot } from "@/shared/domain/AggregateRoot";
import { BadRequestError } from "@/shared/error/BadRequestError";
import type { EAccommodationType } from "@/modules/accommodation/enums/EAccommodationType";
import type { ERentalType } from "@/modules/accommodation/enums/ERentalType";
import { EAccommodationStatus } from "@/modules/accommodation/enums/EAccommodationStatus";
import type { Address } from "@/modules/accommodation/domain/Address";
import type { FacilityConfig } from "@/modules/accommodation/domain/FacilityConfig";
import type { DynamicPricingSettings } from "@/modules/accommodation/domain/DynamicPricingSettings";

export interface AccommodationProps {
	id: string;
	name: string;
	description: string | null;
	type: EAccommodationType;
	rentalType: ERentalType | null;
	status: EAccommodationStatus;
	ownerId: string;
	/** Dynamic-pricing config (JSON in persistence); owned by the pricing engine. */
	dynamicPricingSettings: DynamicPricingSettings | null;
	address: Address | null;
	facilities: FacilityConfig[];
	createdAt?: Date;
	updatedAt?: Date;
}

/**
 * The Accommodation aggregate root — the consistency boundary over an
 * accommodation plus its 1:1 address and facility configs. The DAO loads/persists
 * the graph; lifecycle rules (e.g. "already published") live here.
 *
 * NOTE: rooms are NOT a child of this aggregate — they live in the room module
 * (which this module reads via `IRoomService`) to keep the module graph acyclic.
 * Live availability / booked counts live in the booking module.
 */
export class Accommodation extends AggregateRoot {
	private readonly _name: string;
	private readonly _description: string | null;
	private readonly _type: EAccommodationType;
	private readonly _rentalType: ERentalType | null;
	private _status: EAccommodationStatus;
	private readonly _ownerId: string;
	private readonly _dynamicPricingSettings: DynamicPricingSettings | null;
	private readonly _address: Address | null;
	private readonly _facilities: FacilityConfig[];
	public readonly createdAt?: Date;
	public readonly updatedAt?: Date;

	private constructor(props: AccommodationProps) {
		super(props.id);
		this._name = props.name;
		this._description = props.description;
		this._type = props.type;
		this._rentalType = props.rentalType;
		this._status = props.status;
		this._ownerId = props.ownerId;
		this._dynamicPricingSettings = props.dynamicPricingSettings;
		this._address = props.address;
		this._facilities = props.facilities;
		this.createdAt = props.createdAt;
		this.updatedAt = props.updatedAt;
	}

	/** Reconstitute an accommodation (with address + facility configs) from persistence. */
	public static rehydrate(props: AccommodationProps): Accommodation {
		return new Accommodation(props);
	}

	public get name(): string {
		return this._name;
	}

	public get description(): string | null {
		return this._description;
	}

	public get type(): EAccommodationType {
		return this._type;
	}

	public get rentalType(): ERentalType | null {
		return this._rentalType;
	}

	public get status(): EAccommodationStatus {
		return this._status;
	}

	public get ownerId(): string {
		return this._ownerId;
	}

	public get dynamicPricingSettings(): DynamicPricingSettings | null {
		return this._dynamicPricingSettings;
	}

	public get address(): Address | null {
		return this._address;
	}

	public get facilities(): readonly FacilityConfig[] {
		return this._facilities;
	}

	/** Guard: an accommodation may only be published once (mirrors the monolith). */
	public assertPublishable(): void {
		if (this._status === EAccommodationStatus.PUBLISHED) {
			throw new BadRequestError("This accommodation is already published");
		}
	}
}
