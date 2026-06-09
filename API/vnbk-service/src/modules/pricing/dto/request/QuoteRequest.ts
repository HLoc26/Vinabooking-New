import { ArrayMinSize, IsArray, IsISO8601, IsOptional, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { QuoteItemRequest } from "@/modules/pricing/dto/request/QuoteItemRequest";

/**
 * Request body for `POST /pricing/quote`. Dates are ISO-8601 strings; the engine
 * enumerates nights in the Asia/Ho_Chi_Minh timezone (spec §1.3).
 */
export class QuoteRequest {
	@IsISO8601()
	checkIn!: string;

	@IsISO8601()
	checkOut!: string;

	@IsOptional()
	@IsISO8601()
	bookedAt?: string;

	@IsArray()
	@ArrayMinSize(1)
	@ValidateNested({ each: true })
	@Type(() => QuoteItemRequest)
	items!: QuoteItemRequest[];
}
