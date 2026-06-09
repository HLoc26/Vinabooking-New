import { EViewType, EPricingType } from "@/generated/client";
import { Bed } from "./bed.model";
import { AmenityConfig } from "./amenity-config.model";

export class Room {
	public constructor(
		private readonly id: string,
		private readonly accommodationId: string,
		private name: string,
		private description: string | null,
		private quantity: number,
		private maxAdults: number,
		private maxChildren: number,
		private size: number | null, // Prisma Decimal -> number
		private bedroomCount: number,
		private bathroomCount: number,
		private viewType: EViewType,
		private viewDescription: string | null,
		private basePrice: number,
		private floorPrice: number,
		private pricingType: EPricingType,
		private isActive: boolean,
		private readonly createdAt: Date,
		private updatedAt: Date,
		// Aggregate relations
		private beds: Bed[],
		private amenities: AmenityConfig[]
	) {}

	// Getters
	public getId(): string { return this.id; }
	public getAccommodationId(): string { return this.accommodationId; }
	public getName(): string { return this.name; }
	public getDescription(): string | null { return this.description; }
	public getQuantity(): number { return this.quantity; }
	public getMaxAdults(): number { return this.maxAdults; }
	public getMaxChildren(): number { return this.maxChildren; }
	public getSize(): number | null { return this.size; }
	public getBedroomCount(): number { return this.bedroomCount; }
	public getBathroomCount(): number { return this.bathroomCount; }
	public getViewType(): EViewType { return this.viewType; }
	public getViewDescription(): string | null { return this.viewDescription; }
	public getBasePrice(): number { return this.basePrice; }
	public getFloorPrice(): number { return this.floorPrice; }
	public getPricingType(): EPricingType { return this.pricingType; }
	public getIsActive(): boolean { return this.isActive; }
	public getCreatedAt(): Date { return this.createdAt; }
	public getUpdatedAt(): Date { return this.updatedAt; }
	public getBeds(): Bed[] { return [...this.beds]; }
	public getAmenities(): AmenityConfig[] { return [...this.amenities]; }

	// Domain Logic

	public updateDetails(params: {
		name?: string;
		description?: string | null;
		quantity?: number;
		maxAdults?: number;
		maxChildren?: number;
		size?: number | null;
		bedroomCount?: number;
		bathroomCount?: number;
		viewType?: EViewType;
		viewDescription?: string | null;
		basePrice?: number;
		floorPrice?: number;
		pricingType?: EPricingType;
		isActive?: boolean;
	}): void {
		if (params.name !== undefined) this.name = params.name;
		if (params.description !== undefined) this.description = params.description;
		if (params.quantity !== undefined) this.quantity = params.quantity;
		if (params.maxAdults !== undefined) this.maxAdults = params.maxAdults;
		if (params.maxChildren !== undefined) this.maxChildren = params.maxChildren;
		if (params.size !== undefined) this.size = params.size;
		if (params.bedroomCount !== undefined) this.bedroomCount = params.bedroomCount;
		if (params.bathroomCount !== undefined) this.bathroomCount = params.bathroomCount;
		if (params.viewType !== undefined) this.viewType = params.viewType;
		if (params.viewDescription !== undefined) this.viewDescription = params.viewDescription;
		if (params.pricingType !== undefined) this.pricingType = params.pricingType;
		if (params.isActive !== undefined) this.isActive = params.isActive;

		if (params.basePrice !== undefined || params.floorPrice !== undefined) {
			const newBase = params.basePrice ?? this.basePrice;
			const newFloor = params.floorPrice ?? this.floorPrice;
			this.updatePrices(newBase, newFloor);
		}

		this.updatedAt = new Date();
	}

	private updatePrices(newBase: number, newFloor: number): void {
		if (newFloor > newBase) {
			this.floorPrice = newBase;
			this.basePrice = newBase;
		} else {
			this.basePrice = newBase;
			this.floorPrice = newFloor;
		}
	}

	public calculateAndApplyFloorPrice(percent: number, minAmount: number): void {
		const calculated = Math.max(this.basePrice * (percent / 100), minAmount);
		const finalFloor = Math.min(calculated, this.basePrice);
		this.floorPrice = finalFloor;
		this.updatedAt = new Date();
	}

	public setBeds(beds: Bed[]): void {
		this.beds = beds;
		this.updatedAt = new Date();
	}

	public setAmenities(amenities: AmenityConfig[]): void {
		this.amenities = amenities;
		this.updatedAt = new Date();
	}

	public static builder(): RoomBuilder {
		return new RoomBuilder();
	}
}

export class RoomBuilder {
	private id?: string;
	private accommodationId?: string;
	private name?: string;
	private description: string | null = null;
	private quantity: number = 1;
	private maxAdults: number = 2;
	private maxChildren: number = 0;
	private size: number | null = null;
	private bedroomCount: number = 1;
	private bathroomCount: number = 1;
	private viewType?: EViewType;
	private viewDescription: string | null = null;
	private basePrice: number = 0;
	private floorPrice: number = 0;
	private pricingType?: EPricingType;
	private isActive: boolean = true;
	private createdAt?: Date;
	private updatedAt?: Date;
	private beds: Bed[] = [];
	private amenities: AmenityConfig[] = [];

	public setId(id: string): this {
		this.id = id;
		return this;
	}

	public setAccommodationId(accommodationId: string): this {
		this.accommodationId = accommodationId;
		return this;
	}

	public setName(name: string): this {
		this.name = name;
		return this;
	}

	public setDescription(description: string | null | undefined): this {
		this.description = description ?? null;
		return this;
	}

	public setQuantity(quantity: number | undefined): this {
		if (quantity !== undefined) this.quantity = quantity;
		return this;
	}

	public setCapacity(maxAdults: number | undefined, maxChildren: number | undefined): this {
		if (maxAdults !== undefined) this.maxAdults = maxAdults;
		if (maxChildren !== undefined) this.maxChildren = maxChildren;
		return this;
	}

	public setDimensions(size: number | null | undefined, bedroomCount: number | undefined, bathroomCount: number | undefined): this {
		this.size = size ?? null;
		if (bedroomCount !== undefined) this.bedroomCount = bedroomCount;
		if (bathroomCount !== undefined) this.bathroomCount = bathroomCount;
		return this;
	}

	public setView(viewType: EViewType | undefined, viewDescription: string | null | undefined): this {
		if (viewType !== undefined) this.viewType = viewType;
		this.viewDescription = viewDescription ?? null;
		return this;
	}

	public setPricing(basePrice: number | undefined, floorPrice: number | undefined, pricingType: EPricingType | undefined): this {
		this.basePrice = basePrice ?? 0;
		const rawFloorPrice = floorPrice ?? this.basePrice;
		this.floorPrice = Math.min(rawFloorPrice, this.basePrice);
		
		if (pricingType !== undefined) this.pricingType = pricingType;
		return this;
	}

	public setIsActive(isActive: boolean | undefined): this {
		if (isActive !== undefined) this.isActive = isActive;
		return this;
	}

	public setTimestamps(createdAt: Date, updatedAt: Date): this {
		this.createdAt = createdAt;
		this.updatedAt = updatedAt;
		return this;
	}

	public setBeds(beds: Bed[]): this {
		this.beds = beds;
		return this;
	}

	public setAmenities(amenities: AmenityConfig[]): this {
		this.amenities = amenities;
		return this;
	}

	public build(): Room {
		if (!this.id || !this.accommodationId || !this.name || !this.viewType || !this.pricingType) {
			throw new Error("Missing required fields in RoomBuilder");
		}

		const now = new Date();
		return new Room(
			this.id,
			this.accommodationId,
			this.name,
			this.description,
			this.quantity,
			this.maxAdults,
			this.maxChildren,
			this.size,
			this.bedroomCount,
			this.bathroomCount,
			this.viewType,
			this.viewDescription,
			this.basePrice,
			this.floorPrice,
			this.pricingType,
			this.isActive,
			this.createdAt || now,
			this.updatedAt || now,
			this.beds,
			this.amenities
		);
	}
}
