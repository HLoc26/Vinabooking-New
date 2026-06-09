import { IsEnum, IsInt, IsOptional, IsString, Min } from "class-validator";
import { EItemType } from "@/modules/booking/enums/EItemType";

/** A single requested line item (a quantity of a ROOM or BED) in a booking payload. */
export class BookingDetailRequest {
	@IsString()
	itemId!: string;

	@IsEnum(EItemType)
	itemType!: EItemType;

	@IsInt()
	@Min(1)
	count!: number;

	@IsOptional()
	@IsString()
	note?: string;
}
