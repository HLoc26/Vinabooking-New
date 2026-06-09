import type { EEntityType } from "@/modules/image/enums/EEntityType";
import type { ImageResponse } from "@/modules/image/dto/response/ImageResponse";
import type { UploadedImageResponse } from "@/modules/image/dto/response/UploadedImageResponse";
import type { UploadFile } from "@/modules/image/service/ProcessedImage";

/** Images grouped per entity id (the shape accommodation/room embed). */
export type EntityImagesMap = Record<string, ImageResponse[]>;

/** Use-case contract for the image module — the public port other modules depend on. */
export interface IImageService {
	/** All images for a single entity, JSON-safe with full URLs attached. */
	getImagesByEntity(entityType: EEntityType, entityId: string): Promise<ImageResponse[]>;
	/** Batch variant: images for many entities of a type, grouped by entity id. */
	getImagesByEntities(entityType: EEntityType, entityIds: string[]): Promise<EntityImagesMap>;
	/** Process -> upload -> persist a set of uploaded files for one entity. */
	uploadForEntity(entityType: EEntityType, entityId: string, files: UploadFile[]): Promise<UploadedImageResponse[]>;
	/** Delete a single image (DB rows + S3 objects). */
	deleteImage(imageId: string): Promise<void>;
	/** Delete every image of an entity (DB rows + S3 objects). */
	deleteImagesByEntity(entityType: EEntityType, entityId: string): Promise<void>;
}
