export class Address {
    public constructor(
        private readonly id: string,
        private street: string,
        private city: string,
        private country: string,
        private countryCode: string,
        private postalCode: string | null,
        private latitude: number | null,
        private longitude: number | null,
        private fullAddress: string,
        private placeId: string | null,
        private readonly createdAt: Date,
        private readonly updatedAt: Date
    ) {}

    public getId(): string { return this.id; }
    public getStreet(): string { return this.street; }
    public getCity(): string { return this.city; }
    public getCountry(): string { return this.country; }
    public getCountryCode(): string { return this.countryCode; }
    public getPostalCode(): string | null { return this.postalCode; }
    public getLatitude(): number | null { return this.latitude; }
    public getLongitude(): number | null { return this.longitude; }
    public getFullAddress(): string { return this.fullAddress; }
    public getPlaceId(): string | null { return this.placeId; }
    public getCreatedAt(): Date { return this.createdAt; }
    public getUpdatedAt(): Date { return this.updatedAt; }

    public static builder() {
        return new AddressBuilder();
    }
}

export class AddressBuilder {
    private id?: string;
    private street?: string;
    private city?: string;
    private country?: string;
    private countryCode?: string;
    private postalCode: string | null = null;
    private latitude: number | null = null;
    private longitude: number | null = null;
    private fullAddress?: string;
    private placeId: string | null = null;
    private createdAt?: Date;
    private updatedAt?: Date;

    public setId(id: string): this { this.id = id; return this; }
    public setStreet(street: string): this { this.street = street; return this; }
    public setCity(city: string): this { this.city = city; return this; }
    public setCountry(country: string): this { this.country = country; return this; }
    public setCountryCode(countryCode: string): this { this.countryCode = countryCode; return this; }
    public setPostalCode(postalCode: string | null): this { this.postalCode = postalCode; return this; }
    public setLatitude(latitude: number | null): this { this.latitude = latitude; return this; }
    public setLongitude(longitude: number | null): this { this.longitude = longitude; return this; }
    public setFullAddress(fullAddress: string): this { this.fullAddress = fullAddress; return this; }
    public setPlaceId(placeId: string | null): this { this.placeId = placeId; return this; }
    public setCreatedAt(createdAt: Date): this { this.createdAt = createdAt; return this; }
    public setUpdatedAt(updatedAt: Date): this { this.updatedAt = updatedAt; return this; }

    public build(): Address {
        if (!this.id || !this.street || !this.city || !this.country || !this.countryCode || !this.fullAddress) {
            throw new Error("Missing required fields in AddressBuilder");
        }

        const now = new Date();
        return new Address(
            this.id,
            this.street,
            this.city,
            this.country,
            this.countryCode,
            this.postalCode,
            this.latitude,
            this.longitude,
            this.fullAddress,
            this.placeId,
            this.createdAt || now,
            this.updatedAt || now
        );
    }
}
