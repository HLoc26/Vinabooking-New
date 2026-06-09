import { randomUUID } from "crypto";
import { VariantType } from "./image.enums";

export class ImageVariant {
    public constructor(
        private readonly id: string,
        private readonly imageId: string,
        private readonly s3Key: string,
        private readonly variant: VariantType
    ) {}

    public getId(): string { return this.id; }
    public getImageId(): string { return this.imageId; }
    public getS3Key(): string { return this.s3Key; }
    public getVariant(): VariantType { return this.variant; }

    public static builder() {
        return new ImageVariantBuilder();
    }
}

export class ImageVariantBuilder {
    private id?: string;
    private imageId?: string;
    private s3Key?: string;
    private variant?: VariantType;

    public setId(id: string): this { this.id = id; return this; }
    public setImageId(imageId: string): this { this.imageId = imageId; return this; }
    public setS3Key(s3Key: string): this { this.s3Key = s3Key; return this; }
    public setVariant(variant: VariantType): this { this.variant = variant; return this; }

    public build(): ImageVariant {
        if (!this.imageId || !this.s3Key || !this.variant) {
            throw new Error("Missing required fields in ImageVariantBuilder");
        }
        
        const id = this.id || randomUUID();
        return new ImageVariant(id, this.imageId, this.s3Key, this.variant);
    }
}
