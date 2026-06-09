import { IsEnum, IsInt, IsString, Min } from "class-validator";
import { EItemType } from "@/modules/pricing/enums/EItemType";

/** A single line item in a quote request. */
export class QuoteItemRequest {
	@IsEnum(EItemType)
	itemType!: EItemType;

	@IsString()
	itemId!: string;

	@IsInt()
	@Min(1)
	count!: number;
}
