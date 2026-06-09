import { IsBoolean, IsInt, IsNumber, IsOptional, Max, Min } from "class-validator";

/**
 * Early-bird discount config. Applies a flat discount rate when the booking is
 * made at least `leadDays` before check-in (spec §1.2). Mirrors the monolith
 * validation bounds: leadDays ≥ 1 (integer), discountRate ∈ [0, 0.5].
 */
export class EarlyBirdConfigRequest {
	@IsOptional()
	@IsBoolean()
	enabled?: boolean;

	@IsInt()
	@Min(1)
	leadDays!: number;

	@IsNumber()
	@Min(0)
	@Max(0.5)
	discountRate!: number;
}
