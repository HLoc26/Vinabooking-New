/** Per-night pricing detail for a quote item. Dates are YYYY-MM-DD (Asia/Ho_Chi_Minh). */
export class NightBreakdownResponse {
	date!: string;
	list!: number;
	pay!: number;
	holidayMultiplier!: number;
	discountRate!: number;
	flooredTo!: number | null;
}
