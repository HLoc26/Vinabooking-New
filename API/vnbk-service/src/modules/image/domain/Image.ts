import { AggregateRoot } from "@/shared/domain/AggregateRoot";
import { ImageVariant } from "@/modules/image/domain/ImageVariant";
import { ImageReference } from "@/modules/image/domain/ImageReference";
import { EVariantType } from "@/modules/image/enums/EVariantType";

export interface ImageProps {
	id: string;
	s3Key: string;
	filename: string;
	contentType: string;
	size: bigint;
	createdAt?: Date;
	variants?: ImageVariant[];
	references?: ImageReference[];
}

/** The Image aggregate root: an original upload plus its processed variants and entity references. */
export class Image extends AggregateRoot {
	private readonly _s3Key: string;
	private readonly _filename: string;
	private readonly _contentType: string;
	private readonly _size: bigint;
	public readonly createdAt?: Date;
	private readonly _variants: ImageVariant[];
	private readonly _references: ImageReference[];

	private constructor(props: ImageProps) {
		super(props.id);
		this._s3Key = props.s3Key;
		this._filename = props.filename;
		this._contentType = props.contentType;
		this._size = props.size;
		this.createdAt = props.createdAt;
		this._variants = props.variants ?? [];
		this._references = props.references ?? [];
	}

	public static create(props: ImageProps): Image {
		return new Image(props);
	}

	/** Reconstitute an image (with its variants/references) from persistence. */
	public static rehydrate(props: ImageProps): Image {
		return new Image(props);
	}

	public get s3Key(): string {
		return this._s3Key;
	}

	public get filename(): string {
		return this._filename;
	}

	public get contentType(): string {
		return this._contentType;
	}

	public get size(): bigint {
		return this._size;
	}

	public get variants(): readonly ImageVariant[] {
		return this._variants;
	}

	public get references(): readonly ImageReference[] {
		return this._references;
	}

	/** True if this image carries the given processed variant. */
	public hasVariant(variant: EVariantType): boolean {
		return this._variants.some((v) => v.variant === variant);
	}

	/** The entity this image belongs to, if a reference is present. */
	public get entityId(): string | undefined {
		return this._references[0]?.entityId;
	}
}
