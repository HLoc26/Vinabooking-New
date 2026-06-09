import { EAmenityType } from "@/generated/client";

export class AmenityConfig {
	public constructor(
		private readonly id: string,
		private readonly roomId: string,
		private readonly amenityId: string,
		private note: string | null,
		private readonly createdAt: Date,
		private updatedAt: Date,
		// Populated fields from Amenity entity
		private readonly amenityName?: string,
		private readonly amenityType?: EAmenityType,
		private readonly amenityDescription?: string | null
	) {}

	public getId(): string { return this.id; }
	public getRoomId(): string { return this.roomId; }
	public getAmenityId(): string { return this.amenityId; }
	public getNote(): string | null { return this.note; }
	public getCreatedAt(): Date { return this.createdAt; }
	public getUpdatedAt(): Date { return this.updatedAt; }
	public getAmenityName(): string | undefined { return this.amenityName; }
	public getAmenityType(): EAmenityType | undefined { return this.amenityType; }
	public getAmenityDescription(): string | null | undefined { return this.amenityDescription; }

	public updateNote(note: string | null): void {
		this.note = note;
		this.updatedAt = new Date();
	}

	public static builder(): AmenityConfigBuilder {
		return new AmenityConfigBuilder();
	}
}

export class AmenityConfigBuilder {
	private id?: string;
	private roomId?: string;
	private amenityId?: string;
	private note: string | null = null;
	private createdAt?: Date;
	private updatedAt?: Date;
	private amenityName?: string;
	private amenityType?: EAmenityType;
	private amenityDescription?: string | null;

	public setId(id: string): this {
		this.id = id;
		return this;
	}

	public setRoomId(roomId: string): this {
		this.roomId = roomId;
		return this;
	}

	public setAmenityId(amenityId: string): this {
		this.amenityId = amenityId;
		return this;
	}

	public setNote(note: string | null): this {
		this.note = note;
		return this;
	}

	public setTimestamps(createdAt: Date, updatedAt: Date): this {
		this.createdAt = createdAt;
		this.updatedAt = updatedAt;
		return this;
	}

	public setAmenityDetails(name: string, type: EAmenityType, description: string | null): this {
		this.amenityName = name;
		this.amenityType = type;
		this.amenityDescription = description;
		return this;
	}

	public build(): AmenityConfig {
		if (!this.id || !this.roomId || !this.amenityId) {
			throw new Error("Missing required fields in AmenityConfigBuilder");
		}

		const now = new Date();
		return new AmenityConfig(
			this.id,
			this.roomId,
			this.amenityId,
			this.note,
			this.createdAt || now,
			this.updatedAt || now,
			this.amenityName,
			this.amenityType,
			this.amenityDescription
		);
	}
}
