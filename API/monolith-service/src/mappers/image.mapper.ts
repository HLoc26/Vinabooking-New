import { 
    Image as PrismaImage, 
    ImageVariant as PrismaImageVariant, 
    ImageReference as PrismaImageReference,
    EEntityType as PrismaEEntityType,
    EVariantType as PrismaEVariantType
} from "@/generated/client";
import { Image, ImageBuilder, ImageVariant, ImageReference, EntityType, VariantType } from "../models/image";

type FullPrismaImage = PrismaImage & {
    variants?: PrismaImageVariant[];
    references?: PrismaImageReference[];
};

export class ImageMapper {
    public static toDomain(prismaImage: FullPrismaImage): Image {
        const builder = Image.builder()
            .setId(prismaImage.id)
            .setS3Key(prismaImage.s3Key)
            .setFilename(prismaImage.filename)
            .setContentType(prismaImage.contentType)
            .setSize(prismaImage.size)
            .setCreatedAt(prismaImage.createdAt);

        if (prismaImage.variants) {
            const variants = prismaImage.variants.map(v => 
                ImageVariant.builder()
                    .setId(v.id)
                    .setImageId(v.imageId)
                    .setS3Key(v.s3Key)
                    .setVariant(this.mapVariantTypeToDomain(v.variant))
                    .build()
            );
            builder.setVariants(variants);
        }

        if (prismaImage.references) {
            const references = prismaImage.references.map(r => 
                ImageReference.builder()
                    .setId(r.id)
                    .setImageId(r.imageId)
                    .setEntityType(this.mapEntityTypeToDomain(r.entityType))
                    .setEntityId(r.entityId)
                    .setIsPrimary(r.isPrimary)
                    .setCreatedAt(r.createdAt)
                    .build()
            );
            builder.setReferences(references);
        }

        return builder.build();
    }

    public static toPersistence(domainImage: Image): FullPrismaImage {
        return {
            id: domainImage.getId(),
            s3Key: domainImage.getS3Key(),
            filename: domainImage.getFilename(),
            contentType: domainImage.getContentType(),
            size: domainImage.getSize(),
            createdAt: domainImage.getCreatedAt(),
            variants: domainImage.getVariants().map(v => ({
                id: v.getId(),
                imageId: v.getImageId(),
                s3Key: v.getS3Key(),
                variant: this.mapVariantTypeToPersistence(v.getVariant())
            })),
            references: domainImage.getReferences().map(r => ({
                id: r.getId(),
                imageId: r.getImageId(),
                entityType: this.mapEntityTypeToPersistence(r.getEntityType()),
                entityId: r.getEntityId(),
                isPrimary: r.getIsPrimary(),
                createdAt: r.getCreatedAt()
            }))
        };
    }

    private static mapVariantTypeToDomain(prismaVariant: PrismaEVariantType): VariantType {
        return VariantType[prismaVariant as keyof typeof VariantType];
    }

    private static mapVariantTypeToPersistence(domainVariant: VariantType): PrismaEVariantType {
        return PrismaEVariantType[domainVariant as keyof typeof PrismaEVariantType];
    }

    private static mapEntityTypeToDomain(prismaEntity: PrismaEEntityType): EntityType {
        return EntityType[prismaEntity as keyof typeof EntityType];
    }

    private static mapEntityTypeToPersistence(domainEntity: EntityType): PrismaEEntityType {
        return PrismaEEntityType[domainEntity as keyof typeof PrismaEEntityType];
    }
}
