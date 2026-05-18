import { BadRequestError } from "@/errors";
import type { DynamicPricingSettings, EarlyBirdConfig, HolidayOptIn, LongStayConfig } from "@/types/pricing.types";

export const MAX_DISCOUNT_RATE = 0.5;
export const MIN_THRESHOLD_NIGHTS = 2;
export const MIN_LEAD_DAYS = 1;
export const MIN_HOLIDAY_MULTIPLIER = 1;
export const MAX_HOLIDAY_MULTIPLIER = 5;

function isFiniteNumber(v: unknown): v is number {
	return typeof v === "number" && Number.isFinite(v);
}

export function validateLongStayConfig(cfg: LongStayConfig | undefined | null): void {
	if (cfg === undefined || cfg === null) return;
	if (!isFiniteNumber(cfg.thresholdNights) || cfg.thresholdNights < MIN_THRESHOLD_NIGHTS || !Number.isInteger(cfg.thresholdNights)) {
		throw new BadRequestError(`longStayConfig.thresholdNights must be an integer ≥ ${MIN_THRESHOLD_NIGHTS}`);
	}
	if (!isFiniteNumber(cfg.discountRate) || cfg.discountRate < 0 || cfg.discountRate > MAX_DISCOUNT_RATE) {
		throw new BadRequestError(`longStayConfig.discountRate must be in [0, ${MAX_DISCOUNT_RATE}]`);
	}
}

export function validateEarlyBirdConfig(cfg: EarlyBirdConfig | undefined | null): void {
	if (cfg === undefined || cfg === null) return;
	if (!isFiniteNumber(cfg.leadDays) || cfg.leadDays < MIN_LEAD_DAYS || !Number.isInteger(cfg.leadDays)) {
		throw new BadRequestError(`earlyBirdConfig.leadDays must be an integer ≥ ${MIN_LEAD_DAYS}`);
	}
	if (!isFiniteNumber(cfg.discountRate) || cfg.discountRate < 0 || cfg.discountRate > MAX_DISCOUNT_RATE) {
		throw new BadRequestError(`earlyBirdConfig.discountRate must be in [0, ${MAX_DISCOUNT_RATE}]`);
	}
}

export function validateDynamicPricingSettings(settings: DynamicPricingSettings | undefined | null): void {
	if (settings === undefined || settings === null) return;
	validateLongStayConfig(settings.longStayConfig);
	validateEarlyBirdConfig(settings.earlyBirdConfig);
}

export function validateHolidayOptIn(item: HolidayOptIn): void {
	if (!Number.isInteger(item.holidayId) || item.holidayId <= 0) {
		throw new BadRequestError("holidayOptIn.holidayId must be a positive integer");
	}
	if (!isFiniteNumber(item.priceMultiplier) || item.priceMultiplier < MIN_HOLIDAY_MULTIPLIER || item.priceMultiplier > MAX_HOLIDAY_MULTIPLIER) {
		throw new BadRequestError(`holidayOptIn.priceMultiplier must be in [${MIN_HOLIDAY_MULTIPLIER}, ${MAX_HOLIDAY_MULTIPLIER}]`);
	}
}

export function validateHolidayOptIns(items: HolidayOptIn[]): void {
	const seen = new Set<number>();
	for (const item of items) {
		validateHolidayOptIn(item);
		if (seen.has(item.holidayId)) {
			throw new BadRequestError(`Duplicate holidayId in opt-in list: ${item.holidayId}`);
		}
		seen.add(item.holidayId);
	}
}
