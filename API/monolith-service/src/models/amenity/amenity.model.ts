import { randomUUID } from "crypto";
import { AmenityType } from "./amenity.enums";

export class Amenity {
    readonly #updatedAt: Date;
    readonly #createdAt: Date;
    readonly #description: string | null;
    readonly #type: AmenityType;
    readonly #name: string;
    readonly #id: string;

    public constructor(
        id: string,
        name: string,
        type: AmenityType,
        description: string | null,
        createdAt: Date,
        updatedAt: Date
    ) {
        this.#id = id;
        this.#name = name;
        this.#type = type;
        this.#description = description;
        this.#createdAt = createdAt;
        this.#updatedAt = updatedAt;}

    public getId(): string { return this.#id; }
    public getName(): string { return this.#name; }
    public getType(): AmenityType { return this.#type; }
    public getDescription(): string | null { return this.#description; }
    public getCreatedAt(): Date { return this.#createdAt; }
    public getUpdatedAt(): Date { return this.#updatedAt; }

    public static builder() {
        return new AmenityBuilder();
    }
}

export class AmenityBuilder {
    #id?: string;
    #name?: string;
    #type: AmenityType = AmenityType.OTHER;
    #description: string | null = null;
    #createdAt?: Date;
    #updatedAt?: Date;

    public setId(id: string): this { this.#id = id; return this; }
    public setName(name: string): this { this.#name = name; return this; }
    public setType(type: AmenityType): this { this.#type = type; return this; }
    public setDescription(description: string | null): this { this.#description = description; return this; }
    public setCreatedAt(createdAt: Date): this { this.#createdAt = createdAt; return this; }
    public setUpdatedAt(updatedAt: Date): this { this.#updatedAt = updatedAt; return this; }

    public build(): Amenity {
        if (!this.#name) {
            throw new Error("Missing required field 'name' in AmenityBuilder");
        }

        const id = this.#id || randomUUID();
        const now = new Date();
        const createdAt = this.#createdAt || now;
        const updatedAt = this.#updatedAt || now;

        return new Amenity(id, this.#name, this.#type, this.#description, createdAt, updatedAt);
    }
}
