import { EEntityType } from "@/modules/image/enums/EEntityType";
import type { UploadResult } from "@/modules/image/service/ProcessedImage";

/** Everything the repository needs to persist one uploaded image + its variants + reference. */
export interface SaveImageCommand {
	entityType: EEntityType;
	entityId: string;
	uploaded: UploadResult;
	filename: string;
	contentType: string;
	size: number;
}
