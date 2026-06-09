import { IsArray, IsEnum, IsNotEmpty, IsOptional, IsString, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { EAccommodationType } from "@/modules/accommodation/enums/EAccommodationType";
import { ERentalType } from "@/modules/accommodation/enums/ERentalType";
import { DynamicPricingSettingsInput } from "@/modules/accommodation/dto/request/DynamicPricingSettingsInput";
import { HolidayOptInInput } from "@/modules/accommodation/dto/request/HolidayOptInInput";

/**
 * Request body for `POST /accommodations`. Mirrors the monolith
 * CreateAccommodationDTO. A new accommodation starts as DRAFT.
 *
 * `dynamicPricingSettings` / `holidayOptIns` are tri-state:
 *   undefined → inherit the owner's defaults (snapshot)
 *   null      → opt out (no dynamic pricing / no holiday markups)
 *   value     → use as supplied
 * `@IsOptional()` accepts both `undefined` and `null`, preserving the tri-state.
 */
export class CreateAccommodationRequest {
	@IsString()
	@IsNotEmpty()
	name!: string;

	@IsOptional()
	@IsString()
	description?: string;

	@IsEnum(EAccommodationType)
	type!: EAccommodationType;

	@IsOptional()
	@IsEnum(ERentalType)
	rentalType?: ERentalType;

	@IsOptional()
	@ValidateNested()
	@Type(() => DynamicPricingSettingsInput)
	dynamicPricingSettings?: DynamicPricingSettingsInput | null;

	@IsOptional()
	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => HolidayOptInInput)
	holidayOptIns?: HolidayOptInInput[] | null;
}
