import { EBedType } from "@/generated/client";

export class Bed {
	public constructor(
		private readonly id: string,
		private readonly roomId: string,
		private name: string,
		private description: string | null,
		private bedType: EBedType,
		private size: string | null,
		private quantity: number,
		private price: number | null,
		private isActive: boolean,
		private readonly createdAt: Date,
		private updatedAt: Date
	) {}

	// Getters
	public getId(): string { return this.id; }
	public getRoomId(): string { return this.roomId; }
	public getName(): string { return this.name; }
	public getDescription(): string | null { return this.description; }
	public getBedType(): EBedType { return this.bedType; }
	public getSize(): string | null { return this.size; }
	public getQuantity(): number { return this.quantity; }
	public getPrice(): number | null { return this.price; }
	public getIsActive(): boolean { return this.isActive; }
	public getCreatedAt(): Date { return this.createdAt; }
	public getUpdatedAt(): Date { return this.updatedAt; }

	// Setters and Domain Logic
	public updateDetails(params: {
		name?: string;
		description?: string | null;
		bedType?: EBedType;
		size?: string | null;
		quantity?: number;
		price?: number | null;
		isActive?: boolean;
	}): void {
		if (params.name !== undefined) this.name = params.name || "New Bed";
		if (params.description !== undefined) this.description = params.description;
		if (params.size !== undefined) this.size = params.size;
		if (params.price !== undefined) this.price = params.price || 0;
		if (params.isActive !== undefined) this.isActive = params.isActive;

		// Handle bed type and quantity logic
		if (params.bedType !== undefined || params.quantity !== undefined) {
			const typeToSet = params.bedType ?? this.bedType;
			const baseQuantity = params.quantity ?? this.quantity;
			
			// Normalize bunk bed type to EBedType.BUNK_BED if string passed
			const rawType = String(typeToSet).toUpperCase();
			const isBunk = rawType.includes("BUNK");
			
			this.bedType = isBunk ? EBedType.BUNK_BED : typeToSet;
			this.quantity = isBunk ? baseQuantity * 2 : baseQuantity;
		}

		this.updatedAt = new Date();
	}

	public static builder(): BedBuilder {
		return new BedBuilder();
	}
}

export class BedBuilder {
	private id?: string;
	private roomId?: string;
	private name?: string;
	private description: string | null = null;
	private bedType?: EBedType;
	private size: string | null = null;
	private baseQuantity: number = 1;
	private price: number | null = 0;
	private isActive: boolean = true;
	private createdAt?: Date;
	private updatedAt?: Date;

	public setId(id: string): this {
		this.id = id;
		return this;
	}

	public setRoomId(roomId: string): this {
		this.roomId = roomId;
		return this;
	}

	public setName(name: string | null | undefined): this {
		if (name) this.name = name;
		return this;
	}

	public setDescription(description: string | null | undefined): this {
		this.description = description || null;
		return this;
	}

	public setBedType(bedType: EBedType | string): this {
		const rawType = String(bedType).toUpperCase();
		const isBunk = rawType.includes("BUNK");
		this.bedType = isBunk ? EBedType.BUNK_BED : (bedType as EBedType);
		return this;
	}

	public setSize(size: string | null | undefined): this {
		this.size = size || null;
		return this;
	}

	public setQuantity(quantity: number | undefined): this {
		if (quantity !== undefined) this.baseQuantity = quantity;
		return this;
	}

	public setPrice(price: number | null | undefined): this {
		this.price = price ?? 0;
		return this;
	}

	public setIsActive(isActive: boolean): this {
		this.isActive = isActive;
		return this;
	}

	public setTimestamps(createdAt: Date, updatedAt: Date): this {
		this.createdAt = createdAt;
		this.updatedAt = updatedAt;
		return this;
	}

	public build(): Bed {
		if (!this.id || !this.roomId || !this.name || !this.bedType) {
			throw new Error("Missing required fields in BedBuilder.");
		}

		const now = new Date();
		return new Bed(
			this.id,
			this.roomId,
			this.name,
			this.description,
			this.bedType,
			this.size,
			this.baseQuantity,
			this.price,
			this.isActive,
			this.createdAt || now,
			this.updatedAt || now
		);
	}
	
	public setCalculatedQuantity(baseQuantity: number | undefined): this {
		const qty = baseQuantity ?? 1;
		this.baseQuantity = this.bedType === EBedType.BUNK_BED ? qty * 2 : qty;
		return this;
	}

	public setPersistedQuantity(quantity: number): this {
		this.baseQuantity = quantity;
		return this;
	}
}
