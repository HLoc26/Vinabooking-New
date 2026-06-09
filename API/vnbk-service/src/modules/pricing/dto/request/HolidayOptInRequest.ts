import { IsBoolean, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min } from "class-validator";

/**
 * A single owner-wide holiday opt-in. Mirrors the monolith validation bounds:
 * priceMultiplier ∈ [1, 5], preDays/postDays integers in [0, 30].
 */
export class HolidayOptInRequest {
	@IsString()
	@IsNotEmpty()
	holidayCode!: string;

	@IsNumber()
	@Min(1)
	@Max(5)
	priceMultiplier!: number;

	@IsInt()
	@Min(0)
	@Max(30)
	preDays!: number;

	@IsInt()
	@Min(0)
	@Max(30)
	postDays!: number;

	@IsOptional()
	@IsBoolean()
	enabled?: boolean;
}
