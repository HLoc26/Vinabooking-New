import { IsArray, IsOptional, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { DynamicPricingSettingsInput } from "@/modules/accommodation/dto/request/DynamicPricingSettingsInput";
import { HolidayOptInInput } from "@/modules/accommodation/dto/request/HolidayOptInInput";

/**
 * Request body for `PATCH /accommodations/:id/pricing-settings`. Per-accommodation
 * dynamic-pricing + holiday opt-ins. Both fields are tri-state (undefined → leave
 * untouched, null → clear, value → set). The service requires at least one field.
 *
 * NOTE: the owner-level GLOBAL dynamic-pricing sync (apply to all accommodations)
 * is owned by the pricing module and is NOT duplicated here.
 */
export class UpdatePricingSettingsRequest {
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
