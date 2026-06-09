import { Entity } from "@/shared/domain/Entity";
import type { EFacilityType } from "@/modules/accommodation/enums/EFacilityType";

export interface FacilityProps {
	id: string;
	name: string;
	type: EFacilityType;
	description: string | null;
}

/**
 * A facility from the shared catalog (e.g. "Free WiFi", "Pool"). Read-only here —
 * the accommodation module references facilities but does not own their CRUD.
 *
 * NOTE: deferred — the standalone Facility-catalog CRUD lives in its own module
 * (not built). This entity only carries catalog data needed for the detail view.
 */
export class Facility extends Entity {
	private readonly _name: string;
	private readonly _type: EFacilityType;
	private readonly _description: string | null;

	private constructor(props: FacilityProps) {
		super(props.id);
		this._name = props.name;
		this._type = props.type;
		this._description = props.description;
	}

	/** Reconstitute a facility from persistence. */
	public static rehydrate(props: FacilityProps): Facility {
		return new Facility(props);
	}

	public get name(): string {
		return this._name;
	}

	public get type(): EFacilityType {
		return this._type;
	}

	public get description(): string | null {
		return this._description;
	}
}
