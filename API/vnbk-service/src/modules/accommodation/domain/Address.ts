import { Entity } from "@/shared/domain/Entity";

export interface AddressProps {
	id: string;
	street: string;
	city: string;
	country: string;
	countryCode: string;
	postalCode: string | null;
	/** Decimal in persistence; surfaced as a JS number (or null). */
	latitude: number | null;
	/** Decimal in persistence; surfaced as a JS number (or null). */
	longitude: number | null;
	fullAddress: string;
	placeId: string | null;
}

/** The 1:1 address of an accommodation. Lat/long are surfaced as JS numbers. */
export class Address extends Entity {
	private readonly _street: string;
	private readonly _city: string;
	private readonly _country: string;
	private readonly _countryCode: string;
	private readonly _postalCode: string | null;
	private readonly _latitude: number | null;
	private readonly _longitude: number | null;
	private readonly _fullAddress: string;
	private readonly _placeId: string | null;

	private constructor(props: AddressProps) {
		super(props.id);
		this._street = props.street;
		this._city = props.city;
		this._country = props.country;
		this._countryCode = props.countryCode;
		this._postalCode = props.postalCode;
		this._latitude = props.latitude;
		this._longitude = props.longitude;
		this._fullAddress = props.fullAddress;
		this._placeId = props.placeId;
	}

	/** Reconstitute an address from persistence. */
	public static rehydrate(props: AddressProps): Address {
		return new Address(props);
	}

	public get street(): string {
		return this._street;
	}

	public get city(): string {
		return this._city;
	}

	public get country(): string {
		return this._country;
	}

	public get countryCode(): string {
		return this._countryCode;
	}

	public get postalCode(): string | null {
		return this._postalCode;
	}

	public get latitude(): number | null {
		return this._latitude;
	}

	public get longitude(): number | null {
		return this._longitude;
	}

	public get fullAddress(): string {
		return this._fullAddress;
	}

	public get placeId(): string | null {
		return this._placeId;
	}
}
