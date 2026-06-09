import { EAccommodationType, ERentalType, EAccommodationStatus } from "@/generated/client";
import { Address } from "./address.model";
import { FacilityConfig } from "./facility-config.model";
import { AccommodationHoliday } from "./accommodation-holiday.model";
import { DynamicPricingSettings } from "@/types/pricing.types";

export class Accommodation {
    public constructor(
        private readonly id: string,
        private name: string,
        private description: string | null,
        private type: EAccommodationType,
        private rentalType: ERentalType | null,
        private status: EAccommodationStatus,
        private readonly ownerId: string,
        private dynamicPricingSettings: DynamicPricingSettings | null,
        private readonly createdAt: Date,
        private readonly updatedAt: Date,
        private address: Address | null = null,
        private facilities: FacilityConfig[] = [],
        private holidayOptIns: AccommodationHoliday[] = [],
        // Room references or counts needed for publishing validation
        private roomCount: number = 0,
        private allRoomsValid: boolean = false
    ) {
        this.validateName(name);
    }

    public getId(): string { return this.id; }
    public getName(): string { return this.name; }
    public getDescription(): string | null { return this.description; }
    public getType(): EAccommodationType { return this.type; }
    public getRentalType(): ERentalType | null { return this.rentalType; }
    public getStatus(): EAccommodationStatus { return this.status; }
    public getOwnerId(): string { return this.ownerId; }
    public getDynamicPricingSettings(): DynamicPricingSettings | null { return this.dynamicPricingSettings; }
    public getCreatedAt(): Date { return this.createdAt; }
    public getUpdatedAt(): Date { return this.updatedAt; }
    public getAddress(): Address | null { return this.address; }
    public getFacilities(): FacilityConfig[] { return this.facilities; }
    public getHolidayOptIns(): AccommodationHoliday[] { return this.holidayOptIns; }

    public setAddress(address: Address | null): void { this.address = address; }
    public setFacilities(facilities: FacilityConfig[]): void { this.facilities = facilities; }
    public setHolidayOptIns(holidays: AccommodationHoliday[]): void { this.holidayOptIns = holidays; }
    
    public updateBasicInfo(name: string, description: string | null, type: EAccommodationType): void {
        this.validateName(name);
        this.name = name;
        this.description = description;
        this.type = type;
    }

    public updateDynamicPricingSettings(settings: DynamicPricingSettings | null): void {
        this.dynamicPricingSettings = settings;
    }

    public changeStatus(status: EAccommodationStatus): void {
        this.status = status;
    }

    public publish(roomCount: number, allRoomsValid: boolean): void {
        if (this.status === EAccommodationStatus.PUBLISHED) {
            throw new Error("This accommodation is already published");
        }
        if (!this.address) {
            throw new Error("Cannot publish: Missing address information.");
        }
        if (roomCount === 0) {
            throw new Error("Cannot publish: You must add at least one room.");
        }
        if (!allRoomsValid) {
            throw new Error("Cannot publish: One or more rooms have invalid pricing or capacity.");
        }

        this.status = EAccommodationStatus.PUBLISHED;
    }

    private validateName(name: string): void {
        if (!name || name.trim() === "") {
            throw new Error("Accommodation name cannot be empty");
        }
    }

    public static builder() {
        return new AccommodationBuilder();
    }
}

export class AccommodationBuilder {
    private id?: string;
    private name?: string;
    private description: string | null = null;
    private type?: EAccommodationType;
    private rentalType: ERentalType | null = null;
    private status: EAccommodationStatus = EAccommodationStatus.DRAFT;
    private ownerId?: string;
    private dynamicPricingSettings: DynamicPricingSettings | null = null;
    private createdAt?: Date;
    private updatedAt?: Date;
    private address: Address | null = null;
    private facilities: FacilityConfig[] = [];
    private holidayOptIns: AccommodationHoliday[] = [];
    private roomCount: number = 0;
    private allRoomsValid: boolean = false;

    public setId(id: string): this { this.id = id; return this; }
    public setName(name: string): this { this.name = name; return this; }
    public setDescription(description: string | null): this { this.description = description; return this; }
    public setType(type: EAccommodationType): this { this.type = type; return this; }
    public setRentalType(rentalType: ERentalType | null): this { this.rentalType = rentalType; return this; }
    public setStatus(status: EAccommodationStatus): this { this.status = status; return this; }
    public setOwnerId(ownerId: string): this { this.ownerId = ownerId; return this; }
    public setDynamicPricingSettings(settings: DynamicPricingSettings | null): this { this.dynamicPricingSettings = settings; return this; }
    public setCreatedAt(createdAt: Date): this { this.createdAt = createdAt; return this; }
    public setUpdatedAt(updatedAt: Date): this { this.updatedAt = updatedAt; return this; }
    public setAddress(address: Address | null): this { this.address = address; return this; }
    public setFacilities(facilities: FacilityConfig[]): this { this.facilities = facilities; return this; }
    public setHolidayOptIns(holidayOptIns: AccommodationHoliday[]): this { this.holidayOptIns = holidayOptIns; return this; }
    public setRoomValidationInfo(roomCount: number, allRoomsValid: boolean): this {
        this.roomCount = roomCount;
        this.allRoomsValid = allRoomsValid;
        return this;
    }

    public build(): Accommodation {
        if (!this.id || !this.name || !this.type || !this.ownerId) {
            throw new Error("Missing required fields in AccommodationBuilder");
        }

        const now = new Date();
        return new Accommodation(
            this.id,
            this.name,
            this.description,
            this.type,
            this.rentalType,
            this.status,
            this.ownerId,
            this.dynamicPricingSettings,
            this.createdAt || now,
            this.updatedAt || now,
            this.address,
            this.facilities,
            this.holidayOptIns,
            this.roomCount,
            this.allRoomsValid
        );
    }
}
