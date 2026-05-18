// Mirror of API's DynamicPricingSettings + holiday opt-in DTOs.

export interface LongStayConfig {
	enabled?: boolean;
	thresholdNights: number; // ≥ 2
	discountRate: number; // [0, 0.5]
}

export interface EarlyBirdConfig {
	enabled?: boolean;
	leadDays: number; // ≥ 1
	discountRate: number; // [0, 0.5]
}

export interface DynamicPricingSettings {
	longStayConfig?: LongStayConfig;
	earlyBirdConfig?: EarlyBirdConfig;
}

export interface HolidayDto {
	id: number;
	name: string;
	date: string; // ISO date
	isRecurring: boolean;
}

export interface HolidayOptIn {
	holidayId: number;
	priceMultiplier: number; // [1, 5]
	enabled?: boolean;
}

export interface OwnerHolidayRow {
	id: string;
	holidayId: number;
	priceMultiplier: number;
	enabled: boolean;
	holiday: HolidayDto;
}

export interface OwnerSettingsResponse {
	ownerProfileId: string;
	dynamicPricingSettings: DynamicPricingSettings | null;
}

// ----- Quote -----

export interface QuoteItemInput {
	itemType: "ROOM" | "BED";
	itemId: string;
	count: number;
}

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
