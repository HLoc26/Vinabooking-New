/**
 * Dynamic-pricing settings stored on an accommodation (persisted as JSON).
 *
 * The pricing module is the source of truth for HOW these are applied; the
 * accommodation module only stores and passes them through. This is a local,
 * structurally-compatible value type so the accommodation module does not couple
 * to a non-public pricing internal (the pricing barrel does not export its own
 * `DynamicPricingSettings`). Treated as opaque JSON by the DAO.
 */
export interface LongStayConfig {
	enabled?: boolean;
	thresholdNights: number;
	discountRate: number;
}

export interface EarlyBirdConfig {
	enabled?: boolean;
	leadDays: number;
	discountRate: number;
}

export interface DynamicPricingSettings {
	longStayConfig?: LongStayConfig;
	earlyBirdConfig?: EarlyBirdConfig;
}
