/** Long-stay discount config: a flat rate once the stay reaches `thresholdNights`. */
export interface LongStayConfig {
	enabled?: boolean;
	thresholdNights: number;
	discountRate: number;
}

/** Early-bird discount config: a flat rate once the booking lead time reaches `leadDays`. */
export interface EarlyBirdConfig {
	enabled?: boolean;
	leadDays: number;
	discountRate: number;
}

/**
 * Dynamic-pricing settings attached to an owner profile / accommodation
 * (persisted as JSON). A plain value object — the engine reads it per item.
 */
export interface DynamicPricingSettings {
	longStayConfig?: LongStayConfig;
	earlyBirdConfig?: EarlyBirdConfig;
}
