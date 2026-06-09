import { EItemType } from "@/modules/pricing/enums/EItemType";
import { QuoteItemPricingResponse } from "@/modules/pricing/dto/response/QuoteItemPricingResponse";

/** A single priced line item in a quote response. */
export class QuoteItemResponse {
	itemType!: EItemType;
	itemId!: string;
	name!: string;
	count!: number;
	pricing!: QuoteItemPricingResponse;
}
