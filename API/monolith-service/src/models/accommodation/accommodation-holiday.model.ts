export class AccommodationHoliday {
    public constructor(
        private readonly id: string,
        private readonly accommodationId: string,
        private holidayCode: string,
        private priceMultiplier: number,
        private preDays: number,
        private postDays: number,
        private enabled: boolean
    ) {
        this.validateMultiplier(priceMultiplier);
        this.validateDays(preDays, postDays);
    }

    public getId(): string { return this.id; }
    public getAccommodationId(): string { return this.accommodationId; }
    public getHolidayCode(): string { return this.holidayCode; }
    public getPriceMultiplier(): number { return this.priceMultiplier; }
    public getPreDays(): number { return this.preDays; }
    public getPostDays(): number { return this.postDays; }
    public getEnabled(): boolean { return this.enabled; }

    public setEnabled(enabled: boolean): void { this.enabled = enabled; }

    public updateMultiplier(multiplier: number): void {
        this.validateMultiplier(multiplier);
        this.priceMultiplier = multiplier;
    }

    public updateDays(preDays: number, postDays: number): void {
        this.validateDays(preDays, postDays);
        this.preDays = preDays;
        this.postDays = postDays;
    }

    private validateMultiplier(multiplier: number): void {
        if (multiplier < 0) {
            throw new Error("Price multiplier cannot be negative");
        }
    }

    private validateDays(preDays: number, postDays: number): void {
        if (preDays < 0 || postDays < 0) {
            throw new Error("Pre and post days cannot be negative");
        }
    }

    public static builder() {
        return new AccommodationHolidayBuilder();
    }
}

export class AccommodationHolidayBuilder {
    private id?: string;
    private accommodationId?: string;
    private holidayCode?: string;
    private priceMultiplier: number = 1.0;
    private preDays: number = 0;
    private postDays: number = 0;
    private enabled: boolean = true;

    public setId(id: string): this { this.id = id; return this; }
    public setAccommodationId(accommodationId: string): this { this.accommodationId = accommodationId; return this; }
    public setHolidayCode(holidayCode: string): this { this.holidayCode = holidayCode; return this; }
    public setPriceMultiplier(priceMultiplier: number): this { this.priceMultiplier = priceMultiplier; return this; }
    public setPreDays(preDays: number): this { this.preDays = preDays; return this; }
    public setPostDays(postDays: number): this { this.postDays = postDays; return this; }
    public setEnabled(enabled: boolean): this { this.enabled = enabled; return this; }

    public build(): AccommodationHoliday {
        if (!this.id || !this.accommodationId || !this.holidayCode) {
            throw new Error("Missing required fields in AccommodationHolidayBuilder");
        }

        return new AccommodationHoliday(
            this.id,
            this.accommodationId,
            this.holidayCode,
            this.priceMultiplier,
            this.preDays,
            this.postDays,
            this.enabled
        );
    }
}
