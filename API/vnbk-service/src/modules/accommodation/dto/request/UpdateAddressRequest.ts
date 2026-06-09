import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

/** Request body for `PUT /accommodations/:id/address`. Upserts the 1:1 address. */
export class UpdateAddressRequest {
	@IsString()
	@IsNotEmpty()
	street!: string;

	@IsString()
	@IsNotEmpty()
	city!: string;

	@IsString()
	@IsNotEmpty()
	country!: string;

	@IsString()
	@IsNotEmpty()
	countryCode!: string;

	@IsOptional()
	@IsString()
	postalCode?: string;

	@IsOptional()
	@IsNumber()
	latitude?: number;

	@IsOptional()
	@IsNumber()
	longitude?: number;

	@IsString()
	@IsNotEmpty()
	fullAddress!: string;

	@IsOptional()
	@IsString()
	placeId?: string;
}
