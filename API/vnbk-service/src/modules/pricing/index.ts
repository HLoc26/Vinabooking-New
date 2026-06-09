// Public surface of the pricing module. Other modules (booking, room) import ONLY from here.

// Module + DI token
export { PricingModule } from "@/modules/pricing/PricingModule";
export { PRICING_SERVICE } from "@/modules/pricing/pricing.tokens";

// Service contract — the key cross-module entry point is `quote(QuoteRequest): Promise<QuoteResponse>`.
export type { IPricingService } from "@/modules/pricing/service/IPricingService";

// Enums
export { EItemType } from "@/modules/pricing/enums/EItemType";

// Quote request DTOs
export { QuoteRequest } from "@/modules/pricing/dto/request/QuoteRequest";
export { QuoteItemRequest } from "@/modules/pricing/dto/request/QuoteItemRequest";

// Quote response DTOs
export { QuoteResponse } from "@/modules/pricing/dto/response/QuoteResponse";
export { QuoteItemResponse } from "@/modules/pricing/dto/response/QuoteItemResponse";
export { QuoteItemPricingResponse } from "@/modules/pricing/dto/response/QuoteItemPricingResponse";
export { QuoteTotalsResponse } from "@/modules/pricing/dto/response/QuoteTotalsResponse";
export { NightBreakdownResponse } from "@/modules/pricing/dto/response/NightBreakdownResponse";
