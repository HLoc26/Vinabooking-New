export interface ImageVariantDto {
    id: string;
    s3Key: string;
    variant: string;
}

export interface ImageDto {
    id: string;
    filename: string;
    variants: ImageVariantDto[];
    isPrimary?: boolean;
}
