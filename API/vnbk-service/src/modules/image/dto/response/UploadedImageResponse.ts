import { EVariantType } from "@/modules/image/enums/EVariantType";

/** One persisted image record (original or variant) returned from an upload. */
export class UploadedImageResponse {
	id!: string;
	s3Key!: string;
	variant!: EVariantType;
}
