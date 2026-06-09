/** Wire representation of an accommodation's address. Lat/long as JS numbers. */
export class AddressResponse {
	id!: string;
	street!: string;
	city!: string;
	country!: string;
	countryCode!: string;
	postalCode!: string | null;
	latitude!: number | null;
	longitude!: number | null;
	fullAddress!: string;
	placeId!: string | null;
}
