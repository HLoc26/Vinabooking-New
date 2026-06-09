/** Aggregate totals across all items in a quote. */
export class QuoteTotalsResponse {
	listPrice!: number;
	payablePrice!: number;
	discountApplied!: boolean;
	holidayApplied!: boolean;
}
