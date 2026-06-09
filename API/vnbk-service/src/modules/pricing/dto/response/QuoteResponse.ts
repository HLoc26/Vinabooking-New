import { QuoteItemResponse } from "@/modules/pricing/dto/response/QuoteItemResponse";
import { QuoteTotalsResponse } from "@/modules/pricing/dto/response/QuoteTotalsResponse";

/**
 * Wire (and cross-module) representation of a computed quote. `quoteHash` is a
 * deterministic SHA-256 of the payload (everything except the hash itself),
 * letting the booking module verify the quote was not tampered with (spec §1.4).
 */
export class QuoteResponse {
	currency!: "VND";
	nights!: number;
	items!: QuoteItemResponse[];
	totals!: QuoteTotalsResponse;
	quoteHash!: string;
}
