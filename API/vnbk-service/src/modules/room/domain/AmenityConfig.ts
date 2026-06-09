import { Entity } from "@/shared/domain/Entity";
import type { Amenity } from "@/modules/room/domain/Amenity";

export interface AmenityConfigProps {
	id: string;
	roomId: string;
	amenityId: string;
	note: string | null;
	amenity: Amenity;
}

/**
 * The join entity binding an Amenity to a Room (with an optional per-room note).
 * Carries the resolved `amenity` so a room can expose amenity details directly.
 */
export class AmenityConfig extends Entity {
	private readonly _roomId: string;
	private readonly _amenityId: string;
	private readonly _note: string | null;
	private readonly _amenity: Amenity;

	private constructor(props: AmenityConfigProps) {
		super(props.id);
		this._roomId = props.roomId;
		this._amenityId = props.amenityId;
		this._note = props.note;
		this._amenity = props.amenity;
	}

	/** Reconstitute an amenity config from persistence. */
	public static rehydrate(props: AmenityConfigProps): AmenityConfig {
		return new AmenityConfig(props);
	}

	public get roomId(): string {
		return this._roomId;
	}

	public get amenityId(): string {
		return this._amenityId;
	}

	public get note(): string | null {
		return this._note;
	}

	public get amenity(): Amenity {
		return this._amenity;
	}
}
