import { Entity } from "@/shared/domain/Entity";
import { EEntityType } from "@/modules/image/enums/EEntityType";

export interface ImageReferenceProps {
	id: string;
	entityType: EEntityType;
	entityId: string;
	isPrimary: boolean;
}

/** Links an Image to the entity (accommodation/room/user/review) that owns it. */
export class ImageReference extends Entity {
	private readonly _entityType: EEntityType;
	private readonly _entityId: string;
	private readonly _isPrimary: boolean;

	private constructor(props: ImageReferenceProps) {
		super(props.id);
		this._entityType = props.entityType;
		this._entityId = props.entityId;
		this._isPrimary = props.isPrimary;
	}

	public static create(props: ImageReferenceProps): ImageReference {
		return new ImageReference(props);
	}

	public static rehydrate(props: ImageReferenceProps): ImageReference {
		return new ImageReference(props);
	}

	public get entityType(): EEntityType {
		return this._entityType;
	}

	public get entityId(): string {
		return this._entityId;
	}

	public get isPrimary(): boolean {
		return this._isPrimary;
	}
}
