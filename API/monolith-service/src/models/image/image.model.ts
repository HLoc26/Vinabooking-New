import { randomUUID } from "crypto";
import { EntityType, VariantType } from "./index";
import { ImageReference } from "./image-reference.model";
import { ImageVariant } from "./image-variant.model";

export class Image {
    public constructor(
        private readonly id: string,
        private readonly s3Key: string,
        private readonly filename: string,
        private readonly contentType: string,
        private readonly size: bigint,
        private readonly createdAt: Date,
        private variants: ImageVariant[],
        private references: ImageReference[]
    ) {}

    public getId(): string { return this.id; }
    public getS3Key(): string { return this.s3Key; }
    public getFilename(): string { return this.filename; }
    public getContentType(): string { return this.contentType; }
    public getSize(): bigint { return this.size; }
    public getCreatedAt(): Date { return this.createdAt; }
    public getVariants(): ImageVariant[] { return [...this.variants]; }
    public getReferences(): ImageReference[] { return [...this.references]; }

    public addVariant(variant: ImageVariant): void {
        this.variants.push(variant);
    }

    public addReference(reference: ImageReference): void {
        this.references.push(reference);
    }

    /**
     * Domain Logic: An image is responsible for parsing its own upload results 
     * and generating its required variants.
     */
    public generateVariantsFromUpload(uploadResult: Map<VariantType, any>): void {
        for (const variant of Object.values(VariantType)) {
            if (variant === VariantType.ORIGINAL) {
                const v = ImageVariant.builder()
                    .setImageId(this.id)
                    .setS3Key(this.s3Key)
                    .setVariant(variant)
                    .build();
                this.variants.push(v);
                continue;
            }

            const data = uploadResult.get(variant);
            if (data) {
                const v = ImageVariant.builder()
                    .setImageId(this.id)
                    .setS3Key(data.get("s3Key")!)
                    .setVariant(variant)
                    .build();
                this.variants.push(v);
            }
        }
    }

    /**
     * Domain Logic: Enforces reference invariants.
     */
    public attachToEntity(entityType: EntityType, entityId: string): void {
        // Enforce the rule: User profiles automatically get primary images
        const isPrimary = (entityType === EntityType.USER_PROFILE);
        
        const reference = ImageReference.builder()
            .setImageId(this.id)
            .setEntityType(entityType)
            .setEntityId(entityId)
            .setIsPrimary(isPrimary)
            .build();
            
        this.references.push(reference);
    }

    public static builder() { return new ImageBuilder(); }
}

export class ImageBuilder {
    private id?: string;
    private s3Key?: string;
    private filename?: string;
    private contentType?: string;
    private size?: bigint;
    private createdAt?: Date;
    private variants: ImageVariant[] = [];
    private references: ImageReference[] = [];

    public setId(id: string): this { this.id = id; return this; }
    public setS3Key(s3Key: string): this { this.s3Key = s3Key; return this; }
    public setFilename(filename: string): this { this.filename = filename; return this; }
    public setContentType(contentType: string): this { this.contentType = contentType; return this; }
    public setSize(size: bigint): this { this.size = size; return this; }
    public setCreatedAt(createdAt: Date): this { this.createdAt = createdAt; return this; }
    public setVariants(variants: ImageVariant[]): this { this.variants = variants; return this; }
    public setReferences(references: ImageReference[]): this { this.references = references; return this; }

    public build(): Image {
        if (!this.s3Key || !this.filename || !this.contentType || this.size === undefined) {
            throw new Error("Missing required fields in ImageBuilder");
        }
        
        const id = this.id || randomUUID();
        const createdAt = this.createdAt || new Date();

        return new Image(id, this.s3Key, this.filename, this.contentType, this.size, createdAt, this.variants, this.references);
    }
}
