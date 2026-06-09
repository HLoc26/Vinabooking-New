import { IsBoolean, IsNumber, IsOptional } from "class-validator";

/** Early-bird discount config block of `dynamicPricingSettings`. */
export class EarlyBirdConfigInput {
	@IsOptional()
	@IsBoolean()
	enabled?: boolean;

	@IsNumber()
	leadDays!: number;

	@IsNumber()
	discountRate!: number;
}
