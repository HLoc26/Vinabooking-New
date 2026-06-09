import { IsOptional, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { LongStayConfigInput } from "@/modules/accommodation/dto/request/LongStayConfigInput";
import { EarlyBirdConfigInput } from "@/modules/accommodation/dto/request/EarlyBirdConfigInput";

/**
 * Dynamic-pricing settings supplied on create/update. The accommodation module
 * stores this JSON via its DAO; the deeper numeric range validation (discount
 * rates, lead/threshold bounds) is the pricing engine's concern.
 */
export class DynamicPricingSettingsInput {
	@IsOptional()
	@ValidateNested()
	@Type(() => LongStayConfigInput)
	longStayConfig?: LongStayConfigInput;

	@IsOptional()
	@ValidateNested()
	@Type(() => EarlyBirdConfigInput)
	earlyBirdConfig?: EarlyBirdConfigInput;
}
