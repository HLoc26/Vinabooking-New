import type { Image } from "@/modules/image/domain/Image";
import type { EEntityType } from "@/modules/image/enums/EEntityType";
import type { SaveImageCommand } from "@/modules/image/repository/SaveImageCommand";
import type { UploadedVariantRecord } from "@/modules/image/repository/UploadedVariantRecord";

/** Domain-facing persistence port for images. Returns domain models, never Prisma types. */
export interface IImageRepository {
	/** Persist an Image (original + variants + a reference to its owning entity). */
	saveEntityImage(command: SaveImageCommand): Promise<UploadedVariantRecord[]>;
	/** All images attached to any of the given entities of a type, with variants + references. */
	getEntityImageBatch(entityType: EEntityType, entityIds: string[]): Promise<Image[]>;
	/** Number of image references for one entity. */
	countByEntity(entityType: EEntityType, entityId: string): Promise<number>;
	/** Delete one image (variants + references + row); returns every S3 key freed. */
	deleteImage(imageId: string): Promise<string[]>;
	/** Delete all images of one entity; returns every S3 key freed. */
	deleteEntityImages(entityType: EEntityType, entityId: string): Promise<string[]>;
}
