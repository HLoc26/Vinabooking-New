import { randomUUID } from "crypto";
import { EntityType } from "./image.enums";

export class ImageReference {
    public constructor(
        private readonly id: string,
        private readonly imageId: string,
        private readonly entityType: EntityType,
        private readonly entityId: string,
        private readonly isPrimary: boolean,
        private readonly createdAt: Date
    ) {}

    public getId(): string { return this.id; }
    public getImageId(): string { return this.imageId; }
    public getEntityType(): EntityType { return this.entityType; }
    public getEntityId(): string { return this.entityId; }
    public getIsPrimary(): boolean { return this.isPrimary; }
    public getCreatedAt(): Date { return this.createdAt; }

    public static builder() { return new ImageReferenceBuilder(); }
}

export class ImageReferenceBuilder {
    private id?: string;
    private imageId?: string;
    private entityType?: EntityType;
    private entityId?: string;
    private isPrimary: boolean = false;
    private createdAt?: Date;

    public setId(id: string): this { this.id = id; return this; }
    public setImageId(imageId: string): this { this.imageId = imageId; return this; }
    public setEntityType(entityType: EntityType): this { this.entityType = entityType; return this; }
    public setEntityId(entityId: string): this { this.entityId = entityId; return this; }
    public setIsPrimary(isPrimary: boolean): this { this.isPrimary = isPrimary; return this; }
    public setCreatedAt(createdAt: Date): this { this.createdAt = createdAt; return this; }

    public build(): ImageReference {
        if (!this.imageId || !this.entityType || !this.entityId) {
            throw new Error("Missing required fields in ImageReferenceBuilder");
        }
        
        const id = this.id || randomUUID();
        const createdAt = this.createdAt || new Date();
        
        return new ImageReference(id, this.imageId, this.entityType, this.entityId, this.isPrimary, createdAt);
    }
}
