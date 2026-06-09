import { NightBreakdownResponse } from "@/modules/pricing/dto/response/NightBreakdownResponse";

/** Computed pricing for a single quote item. */
export class QuoteItemPricingResponse {
	listPrice!: number;
	payablePrice!: number;
	averagePricePerNight!: number;
	averageListPricePerNight!: number;
	discountApplied!: boolean;
	holidayApplied!: boolean;
	nightBreakdown!: NightBreakdownResponse[];
}
