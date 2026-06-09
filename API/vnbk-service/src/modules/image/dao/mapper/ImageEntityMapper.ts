import { injectable } from "tsyringe";
import { Prisma } from "@/generated/client";
import type { IMapper } from "@/shared/mapper/IMapper";
import { Image } from "@/modules/image/domain/Image";
import { ImageVariant } from "@/modules/image/domain/ImageVariant";
import { ImageReference } from "@/modules/image/domain/ImageReference";

/** The Prisma Image payload (with variants + references) this mapper translates into the domain. */
export type ImageWithRelations = Prisma.ImageGetPayload<{
	include: {
		variants: true;
		references: true;
	};
}>;

/** Maps between the Prisma Image entity (and its relations) and the Image domain model. DAO-only. */
@injectable()
export class ImageEntityMapper implements IMapper<Image, ImageWithRelations> {
	public toDomain(entity: ImageWithRelations): Image {
		return Image.rehydrate({
			id: entity.id,
			s3Key: entity.s3Key,
			filename: entity.filename,
			contentType: entity.contentType,
			size: entity.size,
			createdAt: entity.createdAt,
			variants: entity.variants.map((v) =>
				ImageVariant.rehydrate({
					id: v.id,
					s3Key: v.s3Key,
					variant: v.variant,
					imageId: v.imageId,
				})
			),
			references: entity.references.map((r) =>
				ImageReference.rehydrate({
					id: r.id,
					entityType: r.entityType,
					entityId: r.entityId,
					isPrimary: r.isPrimary,
				})
			),
		});
	}
}
