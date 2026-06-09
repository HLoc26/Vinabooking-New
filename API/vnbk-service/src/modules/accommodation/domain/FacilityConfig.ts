import { Entity } from "@/shared/domain/Entity";
import type { Facility } from "@/modules/accommodation/domain/Facility";

export interface FacilityConfigProps {
	id: string;
	accommodationId: string;
	facilityId: string;
	/** Decimal in persistence; surfaced as a JS number. */
	fee: number;
	note: string | null;
	isAvailable: boolean;
	/** The resolved catalog facility (name/type/description) when loaded. */
	facility: Facility;
}

/**
 * The join between an accommodation and a catalog facility, carrying the
 * per-accommodation fee, note, and availability flag.
 */
export class FacilityConfig extends Entity {
	private readonly _accommodationId: string;
	private readonly _facilityId: string;
	private readonly _fee: number;
	private readonly _note: string | null;
	private readonly _isAvailable: boolean;
	private readonly _facility: Facility;

	private constructor(props: FacilityConfigProps) {
		super(props.id);
		this._accommodationId = props.accommodationId;
		this._facilityId = props.facilityId;
		this._fee = props.fee;
		this._note = props.note;
		this._isAvailable = props.isAvailable;
		this._facility = props.facility;
	}

	/** Reconstitute a facility config (with its catalog facility) from persistence. */
	public static rehydrate(props: FacilityConfigProps): FacilityConfig {
		return new FacilityConfig(props);
	}

	public get accommodationId(): string {
		return this._accommodationId;
	}

	public get facilityId(): string {
		return this._facilityId;
	}

	public get fee(): number {
		return this._fee;
	}

	public get note(): string | null {
		return this._note;
	}

	public get isAvailable(): boolean {
		return this._isAvailable;
	}

	public get facility(): Facility {
		return this._facility;
	}
}
