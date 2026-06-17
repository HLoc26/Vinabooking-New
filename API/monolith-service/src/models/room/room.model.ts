import { ViewType, PricingType } from "./room.enums";
import { Bed } from "./bed.model";
import { AmenityConfig } from "./amenity-config.model";

export class Room {
    #amenities: AmenityConfig[];
    #beds: Bed[];
    #updatedAt: Date;
    readonly #createdAt: Date;
    #isActive: boolean;
    #pricingType: PricingType;
    #floorPrice: number;
    #basePrice: number;
    #viewDescription: string | null;
    #viewType: ViewType;
    #bathroomCount: number;
    #bedroomCount: number;
    #size: number | null;
    #maxChildren: number;
    #maxAdults: number;
    #quantity: number;
    #description: string | null;
    #name: string;
    readonly #accommodationId: string;
    readonly #id: string;

	public constructor(
		id: string,
		accommodationId: string,
		name: string,
		description: string | null,
		quantity: number,
		maxAdults: number,
		maxChildren: number,
		size: number | null, // Prisma Decimal -> number
		bedroomCount: number,
		bathroomCount: number,
		viewType: ViewType,
		viewDescription: string | null,
		basePrice: number,
		floorPrice: number,
		pricingType: PricingType,
		isActive: boolean,
		createdAt: Date,
		updatedAt: Date,
		// Aggregate relations
		beds: Bed[],
		amenities: AmenityConfig[]
	) {
        this.#id = id;
        this.#accommodationId = accommodationId;
        this.#name = name;
        this.#description = description;
        this.#quantity = quantity;
        this.#maxAdults = maxAdults;
        this.#maxChildren = maxChildren;
        this.#size = size;
        this.#bedroomCount = bedroomCount;
        this.#bathroomCount = bathroomCount;
        this.#viewType = viewType;
        this.#viewDescription = viewDescription;
        this.#basePrice = basePrice;
        this.#floorPrice = floorPrice;
        this.#pricingType = pricingType;
        this.#isActive = isActive;
        this.#createdAt = createdAt;
        this.#updatedAt = updatedAt;
        this.#beds = beds;
        this.#amenities = amenities;}

	// Getters
	public getId(): string { return this.#id; }
	public getAccommodationId(): string { return this.#accommodationId; }
	public getName(): string { return this.#name; }
	public getDescription(): string | null { return this.#description; }
	public getQuantity(): number { return this.#quantity; }
	public getMaxAdults(): number { return this.#maxAdults; }
	public getMaxChildren(): number { return this.#maxChildren; }
	public getSize(): number | null { return this.#size; }
	public getBedroomCount(): number { return this.#bedroomCount; }
	public getBathroomCount(): number { return this.#bathroomCount; }
	public getViewType(): ViewType { return this.#viewType; }
	public getViewDescription(): string | null { return this.#viewDescription; }
	public getBasePrice(): number { return this.#basePrice; }
	public getFloorPrice(): number { return this.#floorPrice; }
	public getPricingType(): PricingType { return this.#pricingType; }
	public getIsActive(): boolean { return this.#isActive; }
	public getCreatedAt(): Date { return this.#createdAt; }
	public getUpdatedAt(): Date { return this.#updatedAt; }
	public getBeds(): Bed[] { return [...this.#beds]; }
	public getAmenities(): AmenityConfig[] { return [...this.#amenities]; }

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
		viewType?: ViewType;
		viewDescription?: string | null;
		basePrice?: number;
		floorPrice?: number;
		pricingType?: PricingType;
		isActive?: boolean;
	}): void {
		if (params.name !== undefined) this.#name = params.name;
		if (params.description !== undefined) this.#description = params.description;
		if (params.quantity !== undefined) this.#quantity = params.quantity;
		if (params.maxAdults !== undefined) this.#maxAdults = params.maxAdults;
		if (params.maxChildren !== undefined) this.#maxChildren = params.maxChildren;
		if (params.size !== undefined) this.#size = params.size;
		if (params.bedroomCount !== undefined) this.#bedroomCount = params.bedroomCount;
		if (params.bathroomCount !== undefined) this.#bathroomCount = params.bathroomCount;
		if (params.viewType !== undefined) this.#viewType = params.viewType;
		if (params.viewDescription !== undefined) this.#viewDescription = params.viewDescription;
		if (params.pricingType !== undefined) this.#pricingType = params.pricingType;
		if (params.isActive !== undefined) this.#isActive = params.isActive;

		if (params.basePrice !== undefined || params.floorPrice !== undefined) {
			const newBase = params.basePrice ?? this.#basePrice;
			const newFloor = params.floorPrice ?? this.#floorPrice;
			this.updatePrices(newBase, newFloor);
		}

		this.#updatedAt = new Date();
	}

	private updatePrices(newBase: number, newFloor: number): void {
		if (newFloor > newBase) {
			this.#floorPrice = newBase;
			this.#basePrice = newBase;
		} else {
			this.#basePrice = newBase;
			this.#floorPrice = newFloor;
		}
	}

	public calculateAndApplyFloorPrice(percent: number, minAmount: number): void {
		const calculated = Math.max(this.#basePrice * (percent / 100), minAmount);
		const finalFloor = Math.min(calculated, this.#basePrice);
		this.#floorPrice = finalFloor;
		this.#updatedAt = new Date();
	}

	public setBeds(beds: Bed[]): void {
		this.#beds = beds;
		this.#updatedAt = new Date();
	}

	public setAmenities(amenities: AmenityConfig[]): void {
		this.#amenities = amenities;
		this.#updatedAt = new Date();
	}

	public static builder(): RoomBuilder {
		return new RoomBuilder();
	}
}

export class RoomBuilder {
	#id?: string;
	#accommodationId?: string;
	#name?: string;
	#description: string | null = null;
	#quantity: number = 1;
	#maxAdults: number = 2;
	#maxChildren: number = 0;
	#size: number | null = null;
	#bedroomCount: number = 1;
	#bathroomCount: number = 1;
	#viewType?: ViewType;
	#viewDescription: string | null = null;
	#basePrice: number = 0;
	#floorPrice: number = 0;
	#pricingType?: PricingType;
	#isActive: boolean = true;
	#createdAt?: Date;
	#updatedAt?: Date;
	#beds: Bed[] = [];
	#amenities: AmenityConfig[] = [];

	public setId(id: string): this {
		this.#id = id;
		return this;
	}

	public setAccommodationId(accommodationId: string): this {
		this.#accommodationId = accommodationId;
		return this;
	}

	public setName(name: string): this {
		this.#name = name;
		return this;
	}

	public setDescription(description: string | null | undefined): this {
		this.#description = description ?? null;
		return this;
	}

	public setQuantity(quantity: number | undefined): this {
		if (quantity !== undefined) this.#quantity = quantity;
		return this;
	}

	public setCapacity(maxAdults: number | undefined, maxChildren: number | undefined): this {
		if (maxAdults !== undefined) this.#maxAdults = maxAdults;
		if (maxChildren !== undefined) this.#maxChildren = maxChildren;
		return this;
	}

	public setDimensions(size: number | null | undefined, bedroomCount: number | undefined, bathroomCount: number | undefined): this {
		this.#size = size ?? null;
		if (bedroomCount !== undefined) this.#bedroomCount = bedroomCount;
		if (bathroomCount !== undefined) this.#bathroomCount = bathroomCount;
		return this;
	}

	public setView(viewType: ViewType | undefined, viewDescription: string | null | undefined): this {
		if (viewType !== undefined) this.#viewType = viewType;
		this.#viewDescription = viewDescription ?? null;
		return this;
	}

	public setPricing(basePrice: number | undefined, floorPrice: number | undefined, pricingType: PricingType | undefined): this {
		this.#basePrice = basePrice ?? 0;
		const rawFloorPrice = floorPrice ?? this.#basePrice;
		this.#floorPrice = Math.min(rawFloorPrice, this.#basePrice);
		
		if (pricingType !== undefined) this.#pricingType = pricingType;
		return this;
	}

	public setIsActive(isActive: boolean | undefined): this {
		if (isActive !== undefined) this.#isActive = isActive;
		return this;
	}

	public setTimestamps(createdAt: Date, updatedAt: Date): this {
		this.#createdAt = createdAt;
		this.#updatedAt = updatedAt;
		return this;
	}

	public setBeds(beds: Bed[]): this {
		this.#beds = beds;
		return this;
	}

	public setAmenities(amenities: AmenityConfig[]): this {
		this.#amenities = amenities;
		return this;
	}

	public build(): Room {
		if (!this.#id || !this.#accommodationId || !this.#name || !this.#viewType || !this.#pricingType) {
			throw new Error("Missing required fields in RoomBuilder");
		}

		const now = new Date();
		return new Room(
			this.#id,
			this.#accommodationId,
			this.#name,
			this.#description,
			this.#quantity,
			this.#maxAdults,
			this.#maxChildren,
			this.#size,
			this.#bedroomCount,
			this.#bathroomCount,
			this.#viewType,
			this.#viewDescription,
			this.#basePrice,
			this.#floorPrice,
			this.#pricingType,
			this.#isActive,
			this.#createdAt || now,
			this.#updatedAt || now,
			this.#beds,
			this.#amenities
		);
	}
}
