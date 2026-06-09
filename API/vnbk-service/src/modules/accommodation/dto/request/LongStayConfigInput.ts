import { IsBoolean, IsNumber, IsOptional } from "class-validator";

/** Long-stay discount config block of `dynamicPricingSettings`. */
export class LongStayConfigInput {
	@IsOptional()
	@IsBoolean()
	enabled?: boolean;

	@IsNumber()
	thresholdNights!: number;

	@IsNumber()
	discountRate!: number;
}
