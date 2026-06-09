import { IsBoolean, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

/**
 * A per-accommodation holiday opt-in stored on create/update. Persisted by the
 * accommodation DAO into `accommodation_holidays`; the owner-level global sync of
 * these opt-ins is owned by the pricing module (not duplicated here).
 */
export class HolidayOptInInput {
	@IsString()
	@IsNotEmpty()
	holidayCode!: string;

	@IsNumber()
	priceMultiplier!: number;

	@IsInt()
	preDays!: number;

	@IsInt()
	postDays!: number;

	@IsOptional()
	@IsBoolean()
	enabled?: boolean;
}
