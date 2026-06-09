import type { QuoteRequest } from "@/modules/pricing/dto/request/QuoteRequest";
import type { QuoteResponse } from "@/modules/pricing/dto/response/QuoteResponse";

/**
 * The pricing engine's use-case contract. `quote` is the cross-module entry
 * point (the booking + room modules depend on it): given a stay window and a
 * set of items, it returns a fully-priced, hash-stamped quote (spec §1).
 */
export interface IPricingService {
	quote(request: QuoteRequest): Promise<QuoteResponse>;
}
