import { inject, injectable } from "tsyringe";
import type { IPricingService } from "@/modules/pricing/service/IPricingService";
import { PRICING_REPOSITORY } from "@/modules/pricing/pricing.tokens";
import type { IPricingRepository } from "@/modules/pricing/repository/IPricingRepository";
import { NightCalendar } from "@/modules/pricing/service/NightCalendar";
import { QuoteHasher } from "@/modules/pricing/service/QuoteHasher";
import { Money } from "@/modules/pricing/domain/Money";
import type { PriceableItem } from "@/modules/pricing/domain/PriceableItem";
import { EItemType } from "@/modules/pricing/enums/EItemType";
import type { QuoteRequest } from "@/modules/pricing/dto/request/QuoteRequest";
import type { QuoteItemRequest } from "@/modules/pricing/dto/request/QuoteItemRequest";
import { QuoteResponse } from "@/modules/pricing/dto/response/QuoteResponse";
import { QuoteItemResponse } from "@/modules/pricing/dto/response/QuoteItemResponse";
import { QuoteItemPricingResponse } from "@/modules/pricing/dto/response/QuoteItemPricingResponse";
import { QuoteTotalsResponse } from "@/modules/pricing/dto/response/QuoteTotalsResponse";
import { NightBreakdownResponse } from "@/modules/pricing/dto/response/NightBreakdownResponse";
import { BadRequestError } from "@/shared/error/BadRequestError";
import { NotFoundError } from "@/shared/error/NotFoundError";

const MAX_DISCOUNT_RATE = 0.5;
const PAD_DAYS = 31;

/**
 * The dynamic-pricing engine. Faithfully ports the monolith `PricingService`:
 * per-night holiday multipliers (Anchor + Window), long-stay & early-bird
 * discounts capped at 50%, floor-price protection, per-night vs static math,
 * and a deterministic quote hash. All money math runs through `Money`
 * (Decimal-backed) to match the monolith's `Prisma.Decimal` semantics exactly.
 */
@injectable()
export class PricingServiceImpl implements IPricingService {
	constructor(
		@inject(PRICING_REPOSITORY) private readonly repository: IPricingRepository,
		private readonly calendar: NightCalendar,
		private readonly hasher: QuoteHasher
	) {}

	public async quote(request: QuoteRequest): Promise<QuoteResponse> {
		if (!request.items || request.items.length === 0) {
			throw new BadRequestError("quote.items must not be empty");
		}

		const checkIn = new Date(request.checkIn);
		const checkOut = new Date(request.checkOut);
		const bookedAt = request.bookedAt ? new Date(request.bookedAt) : new Date();
		if (Number.isNaN(checkIn.getTime()) || Number.isNaN(checkOut.getTime())) {
			throw new BadRequestError("Invalid checkIn or checkOut date");
		}
		if (request.bookedAt !== undefined && Number.isNaN(bookedAt.getTime())) {
			throw new BadRequestError("Invalid bookedAt date");
		}

		const nightYmds = this.calendar.enumerateNights(checkIn, checkOut);
		const nights = nightYmds.length;
		if (nights < 1) throw new BadRequestError("Stay must include at least 1 night");

		const leadDays = Math.max(0, this.calendar.diffDaysHcm(checkIn, bookedAt));

		// Resolve all requested items in one batch.
		const priceableItems = await this.repository.findPriceableItems(request.items.map((i) => ({ itemType: i.itemType, itemId: i.itemId })));
		const itemMap = new Map<string, PriceableItem>(priceableItems.map((i) => [this.itemKey(i.itemType, i.itemId), i]));

		// Prefetch per-accommodation holiday-multiplier maps for every accommodation involved.
		const accIds = new Set<string>(priceableItems.map((i) => i.accommodationId));
		const holidayMapByAcc = new Map<string, Map<string, Money>>();
		await Promise.all(
			Array.from(accIds).map(async (accId) => {
				holidayMapByAcc.set(accId, await this.buildHolidayMapForAccommodation(accId, nightYmds));
			})
		);

		const items: QuoteItemResponse[] = [];
		let totalsListPrice = Money.zero();
		let totalsPayablePrice = Money.zero();
		let anyDiscount = false;
		let anyHoliday = false;

		for (const requested of request.items) {
			const resolved = itemMap.get(this.itemKey(requested.itemType, requested.itemId));
			if (!resolved) {
				// Mirrors the monolith: a bed with no price is reported the same as a missing one.
				const message = requested.itemType === EItemType.ROOM ? `Room ${requested.itemId} not found` : `Bed ${requested.itemId} not found or has no price`;
				throw new NotFoundError(message);
			}

			const baseDiscount = this.resolveBaseDiscount(resolved, nights, leadDays);

			// Non PER_NIGHT items fall back to static math (spec §1.2).
			if (!resolved.pricingTypePerNight) {
				const built = this.buildStaticItem(requested, resolved, nights);
				items.push(built.item);
				totalsListPrice = totalsListPrice.plus(built.listTotal);
				totalsPayablePrice = totalsPayablePrice.plus(built.payTotal);
				continue;
			}

			const holidayMap = holidayMapByAcc.get(resolved.accommodationId) ?? new Map<string, Money>();
			const built = this.buildPerNightItem(requested, resolved, nightYmds, nights, baseDiscount, holidayMap);
			items.push(built.item);
			totalsListPrice = totalsListPrice.plus(built.listTotal);
			totalsPayablePrice = totalsPayablePrice.plus(built.payTotal);
			if (built.discountApplied) anyDiscount = true;
			if (built.holidayApplied) anyHoliday = true;
		}

		const totals = new QuoteTotalsResponse();
		totals.listPrice = totalsListPrice.toNumber(2);
		totals.payablePrice = totalsPayablePrice.toNumber(2);
		totals.discountApplied = anyDiscount;
		totals.holidayApplied = anyHoliday;

		const payload = {
			currency: "VND" as const,
			nights,
			items,
			totals,
		};

		const response = new QuoteResponse();
		response.currency = payload.currency;
		response.nights = payload.nights;
		response.items = payload.items;
		response.totals = payload.totals;
		response.quoteHash = this.hasher.hash(payload);
		return response;
	}

	/**
	 * Build a per-night holiday-multiplier map for a single accommodation,
	 * implementing the Anchor + Window model (spec §1.3).
	 */
	private async buildHolidayMapForAccommodation(accommodationId: string, nightYmds: string[]): Promise<Map<string, Money>> {
		const map = new Map<string, Money>();
		if (nightYmds.length === 0) return map;

		const optIns = await this.repository.findAccommodationHolidayOptIns(accommodationId);
		const enabledConfigs = optIns.filter((o) => o.enabled);
		if (enabledConfigs.length === 0) return map;

		const configByCode = new Map(enabledConfigs.map((c) => [c.holidayCode, c]));

		// Fetch anchors that could cover our stay; pad by ±31 days so pre/post windows pull them in.
		const startMs = this.calendar.ymdToHcmMidnightUtc(nightYmds[0]).getTime();
		const endMs = this.calendar.ymdToHcmMidnightUtc(nightYmds[nightYmds.length - 1]).getTime();
		const pad = PAD_DAYS * this.calendar.dayMs;
		const anchors = await this.repository.findHolidayAnchors(Array.from(configByCode.keys()), new Date(startMs - pad), new Date(endMs + pad));

		const one = Money.one();

		for (const nightYmd of nightYmds) {
			const nightMs = this.calendar.ymdToHcmMidnightUtc(nightYmd).getTime();
			const nightYear = parseInt(nightYmd.split("-")[0], 10);

			let highestMultiplier = one;

			for (const anchor of anchors) {
				const config = configByCode.get(anchor.code);
				if (!config) continue;

				if (anchor.isRecurring) {
					// Check the anchor in the prev/current/next years so windows span year boundaries.
					const anchorMmDd = this.calendar.ymdMmDd(this.calendar.toHcmYmd(anchor.date));
					const candidateYears = [nightYear - 1, nightYear, nightYear + 1];
					for (const yr of candidateYears) {
						const anchorMs = this.calendar.ymdToHcmMidnightUtc(`${yr}-${anchorMmDd}`).getTime();
						const startRange = anchorMs - config.preDays * this.calendar.dayMs;
						const endRange = anchorMs + config.postDays * this.calendar.dayMs;
						if (nightMs >= startRange && nightMs <= endRange && config.priceMultiplier.greaterThan(highestMultiplier)) {
							highestMultiplier = config.priceMultiplier;
						}
					}
				} else {
					const anchorMs = anchor.date.getTime();
					const startRange = anchorMs - config.preDays * this.calendar.dayMs;
					const endRange = anchorMs + config.postDays * this.calendar.dayMs;
					if (nightMs >= startRange && nightMs <= endRange && config.priceMultiplier.greaterThan(highestMultiplier)) {
						highestMultiplier = config.priceMultiplier;
					}
				}
			}

			if (highestMultiplier.greaterThan(one)) {
				map.set(nightYmd, highestMultiplier);
			}
		}

		return map;
	}

	/** Combine the qualifying long-stay + early-bird rates, capped at MAX_DISCOUNT_RATE. */
	private resolveBaseDiscount(item: PriceableItem, nights: number, leadDays: number): Money {
		const settings = item.dynamicPricingSettings ?? {};
		const longStay = settings.longStayConfig;
		const earlyBird = settings.earlyBirdConfig;

		const longStayQualified = !!longStay && longStay.enabled !== false && longStay.discountRate > 0 && nights >= longStay.thresholdNights;
		const earlyBirdQualified = !!earlyBird && earlyBird.enabled !== false && earlyBird.discountRate > 0 && leadDays >= earlyBird.leadDays;

		let baseDiscount = Money.zero();
		if (longStayQualified) baseDiscount = baseDiscount.plus(Money.of(longStay!.discountRate));
		if (earlyBirdQualified) baseDiscount = baseDiscount.plus(Money.of(earlyBird!.discountRate));
		const cap = Money.of(MAX_DISCOUNT_RATE);
		if (baseDiscount.greaterThan(cap)) baseDiscount = cap;
		return baseDiscount;
	}

	/** Per-night pay = basePrice * holidayMultiplier * (1 - discountRate), floored at floorPrice. */
	private computeNight(basePrice: Money, floorPrice: Money | null, multiplier: Money, discountRate: Money): { pay: Money; flooredTo: Money | null } {
		const oneMinusRate = Money.one().minus(discountRate);
		let pay = basePrice.mul(multiplier).mul(oneMinusRate);
		let flooredTo: Money | null = null;
		if (floorPrice && pay.lessThan(floorPrice)) {
			flooredTo = floorPrice;
			pay = floorPrice;
		}
		return { pay, flooredTo };
	}

	private buildStaticItem(requested: QuoteItemRequest, resolved: PriceableItem, nights: number): { item: QuoteItemResponse; listTotal: Money; payTotal: Money } {
		const listOne = resolved.basePrice.mul(nights);
		const payOne = listOne; // no dynamic engine
		const listTotal = listOne.mul(requested.count);
		const payTotal = payOne.mul(requested.count);

		const pricing = new QuoteItemPricingResponse();
		pricing.listPrice = listTotal.toNumber(2);
		pricing.payablePrice = payTotal.toNumber(2);
		pricing.averagePricePerNight = payTotal.dividedBy(nights).dividedBy(requested.count).toNumber(2);
		pricing.averageListPricePerNight = listTotal.dividedBy(nights).dividedBy(requested.count).toNumber(2);
		pricing.discountApplied = false;
		pricing.holidayApplied = false;
		pricing.nightBreakdown = [];

		return { item: this.toItemResponse(requested, resolved, pricing), listTotal, payTotal };
	}

	private buildPerNightItem(
		requested: QuoteItemRequest,
		resolved: PriceableItem,
		nightYmds: string[],
		nights: number,
		baseDiscount: Money,
		holidayMap: Map<string, Money>
	): { item: QuoteItemResponse; listTotal: Money; payTotal: Money; discountApplied: boolean; holidayApplied: boolean } {
		const one = Money.one();
		const zero = Money.zero();
		const breakdown: NightBreakdownResponse[] = [];
		let itemList = Money.zero();
		let itemPay = Money.zero();
		let itemHadDiscount = false;
		let itemHadHoliday = false;

		for (const ymd of nightYmds) {
			const mult = holidayMap.get(ymd) ?? one;
			const isHoliday = !mult.equals(one);
			if (isHoliday) itemHadHoliday = true;

			const { pay, flooredTo } = this.computeNight(resolved.basePrice, resolved.floorPrice, mult, baseDiscount);
			const list = resolved.basePrice;

			if (baseDiscount.greaterThan(zero)) itemHadDiscount = true;

			itemList = itemList.plus(list);
			itemPay = itemPay.plus(pay);

			const entry = new NightBreakdownResponse();
			entry.date = ymd;
			entry.list = list.toNumber(2);
			entry.pay = pay.toNumber(2);
			entry.holidayMultiplier = mult.toNumber(2);
			entry.discountRate = baseDiscount.toNumber(4);
			entry.flooredTo = flooredTo ? flooredTo.toNumber(2) : null;
			breakdown.push(entry);
		}

		const listForItem = itemList.mul(requested.count);
		const payForItem = itemPay.mul(requested.count);

		const pricing = new QuoteItemPricingResponse();
		pricing.listPrice = listForItem.toNumber(2);
		pricing.payablePrice = payForItem.toNumber(2);
		pricing.averagePricePerNight = payForItem.dividedBy(nights).dividedBy(requested.count).toNumber(2);
		pricing.averageListPricePerNight = listForItem.dividedBy(nights).dividedBy(requested.count).toNumber(2);
		pricing.discountApplied = itemHadDiscount;
		pricing.holidayApplied = itemHadHoliday;
		pricing.nightBreakdown = breakdown;

		return {
			item: this.toItemResponse(requested, resolved, pricing),
			listTotal: listForItem,
			payTotal: payForItem,
			discountApplied: itemHadDiscount,
			holidayApplied: itemHadHoliday,
		};
	}

	private toItemResponse(requested: QuoteItemRequest, resolved: PriceableItem, pricing: QuoteItemPricingResponse): QuoteItemResponse {
		const item = new QuoteItemResponse();
		item.itemType = requested.itemType;
		item.itemId = requested.itemId;
		item.name = resolved.name;
		item.count = requested.count;
		item.pricing = pricing;
		return item;
	}

	private itemKey(itemType: EItemType, itemId: string): string {
		return `${itemType}:${itemId}`;
	}
}
