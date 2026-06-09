import { DynamicPricingSettings } from "@/types/pricing.types";
import { OwnerHoliday } from "@/models/owner/owner-holiday.model";

export class OwnerProfile {
    public constructor(
        private readonly id: string,
        private readonly userId: string,
        private businessName: string | null,
        private taxId: string | null,
        private contactPhone: string,
        private isVerified: boolean,
        private dynamicPricingSettings: DynamicPricingSettings | null,
        private readonly createdAt: Date,
        private readonly updatedAt: Date,
        private ownerHolidays: OwnerHoliday[] = []
    ) {
        this.validateContactPhone(contactPhone);
    }

    public getId(): string { return this.id; }
    public getUserId(): string { return this.userId; }
    public getBusinessName(): string | null { return this.businessName; }
    public getTaxId(): string | null { return this.taxId; }
    public getContactPhone(): string { return this.contactPhone; }
    public getIsVerified(): boolean { return this.isVerified; }
    public getDynamicPricingSettings(): DynamicPricingSettings | null { return this.dynamicPricingSettings; }
    public getCreatedAt(): Date { return this.createdAt; }
    public getUpdatedAt(): Date { return this.updatedAt; }
    public getOwnerHolidays(): OwnerHoliday[] { return this.ownerHolidays; }

    public verify(): void {
        if (this.isVerified) {
            throw new Error("Owner profile is already verified");
        }
        if (!this.businessName || this.businessName.trim() === "") {
            throw new Error("Business name is required for verification");
        }
        this.isVerified = true;
    }

    public updateDynamicPricingSettings(settings: DynamicPricingSettings | null): void {
        if (settings) {
            if (settings.earlyBirdConfig?.discountRate && (settings.earlyBirdConfig.discountRate < 0 || settings.earlyBirdConfig.discountRate > 0.5)) {
                throw new Error("Early bird discount rate must be between 0 and 0.5");
            }
            if (settings.longStayConfig?.discountRate && (settings.longStayConfig.discountRate < 0 || settings.longStayConfig.discountRate > 0.5)) {
                throw new Error("Long stay discount rate must be between 0 and 0.5");
            }
        }
        this.dynamicPricingSettings = settings;
    }

    public setOwnerHolidays(holidays: OwnerHoliday[]): void {
        this.ownerHolidays = holidays;
    }

    private validateContactPhone(phone: string): void {
        if (!phone || phone.trim().length === 0) {
            throw new Error("Contact phone cannot be empty");
        }
    }

    public static builder() {
        return new OwnerProfileBuilder();
    }
}

export class OwnerProfileBuilder {
    private id?: string;
    private userId?: string;
    private businessName: string | null = null;
    private taxId: string | null = null;
    private contactPhone?: string;
    private isVerified: boolean = false;
    private dynamicPricingSettings: DynamicPricingSettings | null = null;
    private createdAt?: Date;
    private updatedAt?: Date;
    private ownerHolidays: OwnerHoliday[] = [];

    public setId(id: string): this { this.id = id; return this; }
    public setUserId(userId: string): this { this.userId = userId; return this; }
    public setBusinessName(businessName: string | null): this { this.businessName = businessName; return this; }
    public setTaxId(taxId: string | null): this { this.taxId = taxId; return this; }
    public setContactPhone(contactPhone: string): this { this.contactPhone = contactPhone; return this; }
    public setIsVerified(isVerified: boolean): this { this.isVerified = isVerified; return this; }
    public setDynamicPricingSettings(settings: DynamicPricingSettings | null): this { this.dynamicPricingSettings = settings; return this; }
    public setCreatedAt(createdAt: Date): this { this.createdAt = createdAt; return this; }
    public setUpdatedAt(updatedAt: Date): this { this.updatedAt = updatedAt; return this; }
    public setOwnerHolidays(ownerHolidays: OwnerHoliday[]): this { this.ownerHolidays = ownerHolidays; return this; }

    public build(): OwnerProfile {
        if (!this.id || !this.userId || !this.contactPhone) {
            throw new Error("Missing required fields in OwnerProfileBuilder");
        }

        const now = new Date();
        return new OwnerProfile(
            this.id,
            this.userId,
            this.businessName,
            this.taxId,
            this.contactPhone,
            this.isVerified,
            this.dynamicPricingSettings,
            this.createdAt || now,
            this.updatedAt || now,
            this.ownerHolidays
        );
    }
}
