import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from "class-validator";

/** A single facility-config entry within an `UpdateFacilitiesRequest`. */
export class FacilityConfigInput {
	@IsString()
	@IsNotEmpty()
	facilityId!: string;

	@IsOptional()
	@IsNumber()
	@Min(0)
	fee?: number;

	@IsOptional()
	@IsString()
	note?: string;

	@IsOptional()
	@IsBoolean()
	isAvailable?: boolean;
}
