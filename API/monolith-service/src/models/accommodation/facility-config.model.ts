import { Facility } from "@/models/facility"; // Assuming Facility model exists

export class FacilityConfig {
    public constructor(
        private readonly id: string,
        private fee: number,
        private note: string | null,
        private isAvailable: boolean,
        private readonly createdAt: Date,
        private readonly updatedAt: Date,
        private facility: Facility // Domain model reference
    ) {}

    public getId(): string { return this.id; }
    public getFee(): number { return this.fee; }
    public getNote(): string | null { return this.note; }
    public getIsAvailable(): boolean { return this.isAvailable; }
    public getCreatedAt(): Date { return this.createdAt; }
    public getUpdatedAt(): Date { return this.updatedAt; }
    public getFacility(): Facility { return this.facility; }

    public setFee(fee: number): void {
        if (fee < 0) throw new Error("Facility fee cannot be negative");
        this.fee = fee;
    }
    public setNote(note: string | null): void { this.note = note; }
    public setIsAvailable(isAvailable: boolean): void { this.isAvailable = isAvailable; }

    public static builder() {
        return new FacilityConfigBuilder();
    }
}

export class FacilityConfigBuilder {
    private id?: string;
    private fee: number = 0;
    private note: string | null = null;
    private isAvailable: boolean = true;
    private createdAt?: Date;
    private updatedAt?: Date;
    private facility?: Facility;

    public setId(id: string): this { this.id = id; return this; }
    public setFee(fee: number): this { this.fee = fee; return this; }
    public setNote(note: string | null): this { this.note = note; return this; }
    public setIsAvailable(isAvailable: boolean): this { this.isAvailable = isAvailable; return this; }
    public setCreatedAt(createdAt: Date): this { this.createdAt = createdAt; return this; }
    public setUpdatedAt(updatedAt: Date): this { this.updatedAt = updatedAt; return this; }
    public setFacility(facility: Facility): this { this.facility = facility; return this; }

    public build(): FacilityConfig {
        if (!this.id || !this.facility) {
            throw new Error("Missing required fields in FacilityConfigBuilder");
        }

        const now = new Date();
        return new FacilityConfig(
            this.id,
            this.fee,
            this.note,
            this.isAvailable,
            this.createdAt || now,
            this.updatedAt || now,
            this.facility
        );
    }
}
