export interface ImageVariantDto {
    id: string;
    imageId: string;
    s3Key: string;
    variant: string;
    url: string;
}

export interface ImageReferenceDto {
    id: string;
    imageId: string;
    entityType: string;
    entityId: string;
    isPrimary: boolean;
    createdAt: Date;
}

export interface ImageDto {
    id: string;
    s3Key: string;
    filename: string;
    contentType: string;
    size: string;
    createdAt: Date;
    url: string;
    variants: ImageVariantDto[];
    references: ImageReferenceDto[];
}
