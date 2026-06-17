import { AmenityType } from "../amenity/amenity.enums";

export class AmenityConfig {
    readonly #amenityDescription: string | null | undefined;
    readonly #amenityType: AmenityType | undefined;
    readonly #amenityName: string | undefined;
    #updatedAt: Date;
    readonly #createdAt: Date;
    #note: string | null;
    readonly #amenityId: string;
    readonly #roomId: string;
    readonly #id: string;

	public constructor(
		id: string,
		roomId: string,
		amenityId: string,
		note: string | null,
		createdAt: Date,
		updatedAt: Date,
		// Populated fields from Amenity entity
		amenityName?: string,
		amenityType?: AmenityType,
		amenityDescription?: string | null
	) {
        this.#id = id;
        this.#roomId = roomId;
        this.#amenityId = amenityId;
        this.#note = note;
        this.#createdAt = createdAt;
        this.#updatedAt = updatedAt;
        this.#amenityName = amenityName;
        this.#amenityType = amenityType;
        this.#amenityDescription = amenityDescription;}

	public getId(): string { return this.#id; }
	public getRoomId(): string { return this.#roomId; }
	public getAmenityId(): string { return this.#amenityId; }
	public getNote(): string | null { return this.#note; }
	public getCreatedAt(): Date { return this.#createdAt; }
	public getUpdatedAt(): Date { return this.#updatedAt; }
	public getAmenityName(): string | undefined { return this.#amenityName; }
	public getAmenityType(): AmenityType | undefined { return this.#amenityType; }
	public getAmenityDescription(): string | null | undefined { return this.#amenityDescription; }

	public updateNote(note: string | null): void {
		this.#note = note;
		this.#updatedAt = new Date();
	}

	public static builder(): AmenityConfigBuilder {
		return new AmenityConfigBuilder();
	}
}

export class AmenityConfigBuilder {
	#id?: string;
	#roomId?: string;
	#amenityId?: string;
	#note: string | null = null;
	#createdAt?: Date;
	#updatedAt?: Date;
	#amenityName?: string;
	#amenityType?: AmenityType;
	#amenityDescription?: string | null;

	public setId(id: string): this {
		this.#id = id;
		return this;
	}

	public setRoomId(roomId: string): this {
		this.#roomId = roomId;
		return this;
	}

	public setAmenityId(amenityId: string): this {
		this.#amenityId = amenityId;
		return this;
	}

	public setNote(note: string | null): this {
		this.#note = note;
		return this;
	}

	public setTimestamps(createdAt: Date, updatedAt: Date): this {
		this.#createdAt = createdAt;
		this.#updatedAt = updatedAt;
		return this;
	}

	public setAmenityDetails(name: string, type: AmenityType, description: string | null): this {
		this.#amenityName = name;
		this.#amenityType = type;
		this.#amenityDescription = description;
		return this;
	}

	public build(): AmenityConfig {
		if (!this.#id || !this.#roomId || !this.#amenityId) {
			throw new Error("Missing required fields in AmenityConfigBuilder");
		}

		const now = new Date();
		return new AmenityConfig(
			this.#id,
			this.#roomId,
			this.#amenityId,
			this.#note,
			this.#createdAt || now,
			this.#updatedAt || now,
			this.#amenityName,
			this.#amenityType,
			this.#amenityDescription
		);
	}
}
