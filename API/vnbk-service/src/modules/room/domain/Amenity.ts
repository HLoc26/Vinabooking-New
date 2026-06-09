import { Entity } from "@/shared/domain/Entity";
import type { EAmenityType } from "@/modules/room/enums/EAmenityType";

export interface AmenityProps {
	id: string;
	name: string;
	type: EAmenityType;
	description: string | null;
}

/** A catalog amenity (e.g. "Wifi", "Air conditioning") that rooms can be configured with. */
export class Amenity extends Entity {
	private readonly _name: string;
	private readonly _type: EAmenityType;
	private readonly _description: string | null;

	private constructor(props: AmenityProps) {
		super(props.id);
		this._name = props.name;
		this._type = props.type;
		this._description = props.description;
	}

	/** Reconstitute an amenity from persistence. */
	public static rehydrate(props: AmenityProps): Amenity {
		return new Amenity(props);
	}

	public get name(): string {
		return this._name;
	}

	public get type(): EAmenityType {
		return this._type;
	}

	public get description(): string | null {
		return this._description;
	}
}
