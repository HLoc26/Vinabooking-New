import type { QuoteResponse } from "@/modules/pricing";

/**
 * The authoritative, immutable record of the priced transaction at booking time
 * (spec §1.4). It is the computed `QuoteResponse` (currency, nights, items,
 * totals, quoteHash) plus the resolved stay window — persisted verbatim in the
 * `Booking.pricingSnapshot` JSON column. Storing the full quote (not just the
 * total) means a later price change never rewrites what the guest agreed to pay.
 */
export interface PricingSnapshot extends QuoteResponse {
	/** ISO-8601 check-in instant the quote was computed for. */
	checkIn: string;
	/** ISO-8601 check-out instant the quote was computed for. */
	checkOut: string;
	/** ISO-8601 lead-day basis the FE captured before quoting (anti-hash-drift). */
	bookedAt?: string;
}
