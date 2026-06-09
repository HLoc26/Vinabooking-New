import { IsBoolean, IsInt, IsNumber, IsOptional, Max, Min } from "class-validator";

/**
 * Long-stay discount config. Applies a flat discount rate when the stay length
 * reaches `thresholdNights` (spec §1.2). Mirrors the monolith validation bounds:
 * thresholdNights ≥ 2 (integer), discountRate ∈ [0, 0.5].
 */
export class LongStayConfigRequest {
	@IsOptional()
	@IsBoolean()
	enabled?: boolean;

	@IsInt()
	@Min(2)
	thresholdNights!: number;

	@IsNumber()
	@Min(0)
	@Max(0.5)
	discountRate!: number;
}
