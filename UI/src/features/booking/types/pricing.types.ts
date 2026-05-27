export interface NightBreakdownEntry {
	date: string;
	list: number;
	pay: number;
	holidayMultiplier: number;
	discountRate: number;
	flooredTo: number | null;
}

export interface QuoteItemPricing {
	listPrice: number;
	payablePrice: number;
	averagePricePerNight: number;
	averageListPricePerNight: number;
	discountApplied: boolean;
	holidayApplied: boolean;
	nightBreakdown: NightBreakdownEntry[];
}

export interface QuoteItemOutput {
	itemType: "ROOM" | "BED";
	itemId: string;
	name: string;
	count: number;
	pricing: QuoteItemPricing;
}

export interface QuoteResponse {
	currency: "VND";
	nights: number;
	items: QuoteItemOutput[];
	totals: {
		listPrice: number;
		payablePrice: number;
		discountApplied: boolean;
		holidayApplied: boolean;
	};
	quoteHash: string;
}

export interface QuoteRequestInput {
	checkIn: string;
	checkOut: string;
	items: { itemType: "ROOM" | "BED"; itemId: string; count: number }[];
}
