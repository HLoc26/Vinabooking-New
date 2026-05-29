import type { EItemType } from "@/generated/client";

// ----- Owner / Accommodation dynamic-pricing config -----

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

export interface HolidayOptIn {
	holidayCode: string;
	priceMultiplier: number; // [1, 5]
	preDays: number; // [0, 30]
	postDays: number; // [0, 30]
	enabled?: boolean;
}

// ----- Quote request / response -----

export interface QuoteItemInput {
	itemType: EItemType; // "ROOM" | "BED"
	itemId: string;
	count: number;
}

export interface QuoteRequest {
	checkIn: string | Date;
	checkOut: string | Date;
	bookedAt?: string | Date;
	items: QuoteItemInput[];
}

export interface NightBreakdownEntry {
	date: string; // YYYY-MM-DD (Asia/Ho_Chi_Minh)
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
	itemType: EItemType;
	itemId: string;
	name: string;
	count: number;
	pricing: QuoteItemPricing;
}

export interface QuoteTotals {
	listPrice: number;
	payablePrice: number;
	discountApplied: boolean;
	holidayApplied: boolean;
}

export interface QuoteResponse {
	currency: "VND";
	nights: number;
	items: QuoteItemOutput[];
	totals: QuoteTotals;
	quoteHash: string;
}

// ----- Persisted snapshot (Booking.pricingSnapshot) -----

export type PricingSnapshot = Omit<QuoteResponse, "quoteHash"> & {
	quoteHash: string;
	checkIn: string;
	checkOut: string;
	bookedAt: string;
};

// ----- Owner-pricing API DTOs -----

export interface UpdateOwnerSettingsDTO {
	longStayConfig?: LongStayConfig | null;
	earlyBirdConfig?: EarlyBirdConfig | null;
}

export interface ReplaceOwnerHolidaysDTO {
	items: HolidayOptIn[];
}
