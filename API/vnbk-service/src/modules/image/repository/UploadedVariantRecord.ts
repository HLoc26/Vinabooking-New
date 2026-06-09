import { EVariantType } from "@/modules/image/enums/EVariantType";

/** One persisted image record (original row or a variant row) returned by a save. */
export interface UploadedVariantRecord {
	id: string;
	s3Key: string;
	variant: EVariantType;
}
