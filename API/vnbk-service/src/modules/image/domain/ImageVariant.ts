import { Entity } from "@/shared/domain/Entity";
import { EVariantType } from "@/modules/image/enums/EVariantType";

export interface ImageVariantProps {
	id: string;
	s3Key: string;
	variant: EVariantType;
	imageId?: string;
}

/** A processed rendition (thumbnail/webp/optimized/original) of an Image. */
export class ImageVariant extends Entity {
	private readonly _s3Key: string;
	private readonly _variant: EVariantType;
	private readonly _imageId?: string;

	private constructor(props: ImageVariantProps) {
		super(props.id);
		this._s3Key = props.s3Key;
		this._variant = props.variant;
		this._imageId = props.imageId;
	}

	public static create(props: ImageVariantProps): ImageVariant {
		return new ImageVariant(props);
	}

	public static rehydrate(props: ImageVariantProps): ImageVariant {
		return new ImageVariant(props);
	}

	public get s3Key(): string {
		return this._s3Key;
	}

	public get variant(): EVariantType {
		return this._variant;
	}

	public get imageId(): string | undefined {
		return this._imageId;
	}
}
