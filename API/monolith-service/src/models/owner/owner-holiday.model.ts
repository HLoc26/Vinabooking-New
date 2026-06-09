export class OwnerHoliday {
    #enabled: boolean;
    #postDays: number;
    #preDays: number;
    #priceMultiplier: number;
    readonly #holidayCode: string;
    readonly #ownerProfileId: string;
    readonly #id: string;

    public constructor(
        id: string,
        ownerProfileId: string,
        holidayCode: string,
        priceMultiplier: number,
        preDays: number,
        postDays: number,
        enabled: boolean
    ) {
        this.#id = id;
        this.#ownerProfileId = ownerProfileId;
        this.#holidayCode = holidayCode;
        this.#priceMultiplier = priceMultiplier;
        this.#preDays = preDays;
        this.#postDays = postDays;
        this.#enabled = enabled;
        this.validateMultiplier(priceMultiplier);
        this.validateDays(preDays, postDays);
    }

    public getId(): string { return this.#id; }
    public getOwnerProfileId(): string { return this.#ownerProfileId; }
    public getHolidayCode(): string { return this.#holidayCode; }
    public getPriceMultiplier(): number { return this.#priceMultiplier; }
    public getPreDays(): number { return this.#preDays; }
    public getPostDays(): number { return this.#postDays; }
    public getEnabled(): boolean { return this.#enabled; }

    private validateMultiplier(multiplier: number): void {
        if (multiplier < 1 || multiplier > 5) {
            throw new Error("Price multiplier must be between 1 and 5");
        }
    }

    private validateDays(preDays: number, postDays: number): void {
        if (preDays < 0 || preDays > 30 || postDays < 0 || postDays > 30) {
            throw new Error("Pre-days and post-days must be between 0 and 30");
        }
    }

    public static builder() {
        return new OwnerHolidayBuilder();
    }
}

export class OwnerHolidayBuilder {
    #id?: string;
    #ownerProfileId?: string;
    #holidayCode?: string;
    #priceMultiplier: number = 1.0;
    #preDays: number = 0;
    #postDays: number = 0;
    #enabled: boolean = true;

    public setId(id: string): this { this.#id = id; return this; }
    public setOwnerProfileId(ownerProfileId: string): this { this.#ownerProfileId = ownerProfileId; return this; }
    public setHolidayCode(holidayCode: string): this { this.#holidayCode = holidayCode; return this; }
    public setPriceMultiplier(priceMultiplier: number): this { this.#priceMultiplier = priceMultiplier; return this; }
    public setPreDays(preDays: number): this { this.#preDays = preDays; return this; }
    public setPostDays(postDays: number): this { this.#postDays = postDays; return this; }
    public setEnabled(enabled: boolean): this { this.#enabled = enabled; return this; }

    public build(): OwnerHoliday {
        if (!this.#id || !this.#ownerProfileId || !this.#holidayCode) {
            throw new Error("Missing required fields in OwnerHolidayBuilder");
        }

        return new OwnerHoliday(
            this.#id,
            this.#ownerProfileId,
            this.#holidayCode,
            this.#priceMultiplier,
            this.#preDays,
            this.#postDays,
            this.#enabled
        );
    }
}
