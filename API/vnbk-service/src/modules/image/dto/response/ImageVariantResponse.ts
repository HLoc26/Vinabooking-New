import { EVariantType } from "@/modules/image/enums/EVariantType";

/** Wire representation of a single processed image variant, with its public URL. */
export class ImageVariantResponse {
	id!: string;
	variant!: EVariantType;
	s3Key!: string;
	url!: string;
}
