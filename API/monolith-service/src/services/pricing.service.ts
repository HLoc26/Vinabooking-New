import crypto from "crypto";
import { Prisma, PrismaClient } from "@/generated/client";
import { BadRequestError, NotFoundError } from "@/errors";
import HolidayRepository from "@/repositories/holiday.repository";
import { HolidayMapper } from "@/mappers/holiday.mapper";
import {
	DynamicPricingSettings,
	NightBreakdownEntry,
	QuoteItemOutput,
	QuoteItemPricing,
	QuoteRequest,
	QuoteResponse,
} from "@/types/pricing.types";
import redisClient from "@/clients/redis.client";

import {
	DAY_MS,
	toHcmYmd,
	ymdToHcmMidnightUtc,
	diffDaysHcm,
	enumerateNights,
	ymdMmDd,
	canonicalNumber,
	hashQuote,
} from "@/utils/pricing.utils";

type HolidayOptInRow = {
	holidayCode: string;
	priceMultiplier: Prisma.Decimal;
	preDays: number;
	postDays: number;
	enabled: boolean;
};

const ZERO = new Prisma.Decimal(0);
const ONE = new Prisma.Decimal(1);
const MAX_DISCOUNT_RATE = new Prisma.Decimal("0.5");

class PricingService {
	readonly #prismaClient: PrismaClient;
	readonly #holidayRepository: HolidayRepository;

	constructor(prismaClient: PrismaClient, holidayRepository: HolidayRepository) {
		this.#prismaClient = prismaClient;
		this.#holidayRepository = holidayRepository;
	}

	/**
	 * Build a per-night holiday-multiplier map for a single accommodation.
	 * Implements the Anchor + Window model (§1.3).
	 */
	public async buildHolidayMapForAccommodation(
		accommodationId: string,
		nightYmds: string[]
	): Promise<Map<string, Prisma.Decimal>> {
		const map = new Map<string, Prisma.Decimal>();
		if (nightYmds.length === 0) return map;

		const cacheKeys = nightYmds.map((ymd) => `holiday_map:${accommodationId}:${ymd}`);
		const cachedVals = await redisClient.mGet(cacheKeys);
		const missingYmds: string[] = [];

		cachedVals.forEach((val, i) => {
			if (val) {
				if (val !== "1") map.set(nightYmds[i], new Prisma.Decimal(val));
			} else {
				missingYmds.push(nightYmds[i]);
			}
		});

		if (missingYmds.length === 0) return map;

		// 1. Fetch owner/accommodation opt-ins.
		const optIns = (await this.#holidayRepository.findByAccommodation(accommodationId)) as HolidayOptInRow[];
		const enabledConfigs = optIns.filter((o) => o.enabled);
		
		// If no opt-ins, set all missing to 1 and return
		if (enabledConfigs.length === 0) {
			const multi = redisClient.multi();
			missingYmds.forEach(ymd => multi.set(`holiday_map:${accommodationId}:${ymd}`, "1", { EX: 86400 }));
			await multi.exec();
			return map;
		}

		const configByCode = new Map(enabledConfigs.map((c) => [c.holidayCode, c]));

		// 2. Fetch all holiday anchors that could potentially cover our missing stay.
		const startMs = ymdToHcmMidnightUtc(missingYmds[0]).getTime();
		const endMs = ymdToHcmMidnightUtc(missingYmds[missingYmds.length - 1]).getTime();
		const pad = 31 * DAY_MS;

		const prismaAnchors = await this.#prismaClient.holiday.findMany({
			where: {
				OR: [
					{ isRecurring: false, date: { gte: new Date(startMs - pad), lte: new Date(endMs + pad) } },
					{ isRecurring: true }, // recurring (year 2000) we always fetch and match by MM-DD
				],
				code: { in: Array.from(configByCode.keys()) },
			},
		});

		const anchors = prismaAnchors.map(a => HolidayMapper.toDomain(a));
		const multi = redisClient.multi();

		// 3. For each missing night, check if it falls within ANY expanded holiday window.
		for (const nightYmd of missingYmds) {
			const nightMs = ymdToHcmMidnightUtc(nightYmd).getTime();
			const nightMmDd = ymdMmDd(nightYmd);
			const nightYear = parseInt(nightYmd.split("-")[0], 10);

			let highestMultiplier = ONE;

			for (const anchor of anchors) {
				const config = configByCode.get(anchor.getCode());
				if (!config) continue;

				if (anchor.coversDate(new Date(nightMs), config.preDays, config.postDays)) {
					if (config.priceMultiplier.greaterThan(highestMultiplier)) {
						highestMultiplier = config.priceMultiplier;
					}
				}
			}

			if (highestMultiplier.greaterThan(ONE)) {
				map.set(nightYmd, highestMultiplier);
			}
			
			multi.set(`holiday_map:${accommodationId}:${nightYmd}`, highestMultiplier.toString(), { EX: 86400 });
		}
		
		await multi.exec();

		return map;
	}

	private resolveSettings(raw: Prisma.JsonValue | null | undefined): DynamicPricingSettings {
		if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
		return raw as DynamicPricingSettings;
	}

	private computeNight(
		basePrice: Prisma.Decimal,
		floorPrice: Prisma.Decimal | null,
		multiplier: Prisma.Decimal,
		discountRate: Prisma.Decimal
	): { pay: Prisma.Decimal; flooredTo: Prisma.Decimal | null } {
		const oneMinusRate = ONE.minus(discountRate);
		let pay = basePrice.mul(multiplier).mul(oneMinusRate);
		let flooredTo: Prisma.Decimal | null = null;
		if (floorPrice && pay.lessThan(floorPrice)) {
			flooredTo = floorPrice;
			pay = floorPrice;
		}
		return { pay, flooredTo };
	}

	public async quote(req: QuoteRequest): Promise<QuoteResponse> {
		if (!req.items || req.items.length === 0) {
			throw new BadRequestError("quote.items must not be empty");
		}

		const checkIn = new Date(req.checkIn);
		const checkOut = new Date(req.checkOut);
		const bookedAt = req.bookedAt ? new Date(req.bookedAt) : new Date();
		if (Number.isNaN(checkIn.getTime()) || Number.isNaN(checkOut.getTime())) {
			throw new BadRequestError("Invalid checkIn or checkOut date");
		}
		if (req.bookedAt !== undefined && Number.isNaN(bookedAt.getTime())) {
			throw new BadRequestError("Invalid bookedAt date");
		}

		const nightYmds = enumerateNights(checkIn, checkOut);
		const nights = nightYmds.length;
		if (nights < 1) throw new BadRequestError("Stay must include at least 1 night");

		const leadDays = Math.max(0, diffDaysHcm(checkIn, bookedAt));

		// Bulk-load rooms and beds for the items.
		const roomItems = req.items.filter((i) => i.itemType === "ROOM");
		const bedItems = req.items.filter((i) => i.itemType === "BED");

		const rooms = roomItems.length
			? await this.#prismaClient.room.findMany({
					where: { id: { in: roomItems.map((i) => i.itemId) } },
					include: { accommodation: true },
				})
			: [];
		const beds = bedItems.length
			? await this.#prismaClient.bed.findMany({
					where: { id: { in: bedItems.map((i) => i.itemId) } },
					include: { room: { include: { accommodation: true } } },
				})
			: [];

		const roomMap = new Map(rooms.map((r) => [r.id, r]));
		const bedMap = new Map(beds.map((b) => [b.id, b]));

		// Collect distinct accommodations involved and prefetch their holiday-multiplier maps.
		const accIds = new Set<string>();
		for (const r of rooms) accIds.add(r.accommodationId);
		for (const b of beds) accIds.add(b.room.accommodationId);

		const holidayMapByAcc = new Map<string, Map<string, Prisma.Decimal>>();
		await Promise.all(
			Array.from(accIds).map(async (accId) => {
				const m = await this.buildHolidayMapForAccommodation(accId, nightYmds);
				holidayMapByAcc.set(accId, m);
			})
		);

		const items: QuoteItemOutput[] = [];
		let totalsListPrice = ZERO;
		let totalsPayablePrice = ZERO;
		let anyDiscount = false;
		let anyHoliday = false;

		for (const item of req.items) {
			let basePrice: Prisma.Decimal;
			let floorPrice: Prisma.Decimal | null;
			let name: string;
			let accommodation: { id: string; dynamicPricingSettings: Prisma.JsonValue | null };
			let pricingTypePerNight = true;

			if (item.itemType === "ROOM") {
				const room = roomMap.get(item.itemId);
				if (!room) throw new NotFoundError(`Room ${item.itemId} not found`);
				basePrice = new Prisma.Decimal(room.basePrice);
				floorPrice = new Prisma.Decimal(room.floorPrice);
				name = room.name;
				accommodation = room.accommodation;
				pricingTypePerNight = room.pricingType === "PER_NIGHT";
			} else {
				const bed = bedMap.get(item.itemId);
				if (!bed || !bed.price) throw new NotFoundError(`Bed ${item.itemId} not found or has no price`);
				basePrice = new Prisma.Decimal(bed.price);
				floorPrice = null;
				name = bed.name;
				accommodation = bed.room.accommodation;
				pricingTypePerNight = bed.room.pricingType === "PER_NIGHT";
			}

			const settings = this.resolveSettings(accommodation.dynamicPricingSettings);
			const longStay = settings.longStayConfig;
			const earlyBird = settings.earlyBirdConfig;

			const longStayQualified =
				!!longStay &&
				longStay.enabled !== false &&
				longStay.discountRate > 0 &&
				nights >= longStay.thresholdNights;
			const earlyBirdQualified =
				!!earlyBird &&
				earlyBird.enabled !== false &&
				earlyBird.discountRate > 0 &&
				leadDays >= earlyBird.leadDays;

			let baseDiscount = ZERO;
			if (longStayQualified) baseDiscount = baseDiscount.plus(longStay!.discountRate);
			if (earlyBirdQualified) baseDiscount = baseDiscount.plus(earlyBird!.discountRate);
			if (baseDiscount.greaterThan(MAX_DISCOUNT_RATE)) baseDiscount = MAX_DISCOUNT_RATE;

			const holidayMap = pricingTypePerNight
				? holidayMapByAcc.get(accommodation.id) ?? new Map<string, Prisma.Decimal>()
				: new Map<string, Prisma.Decimal>();

			// Non PER_NIGHT items fall back to static math (spec §1.2).
			if (!pricingTypePerNight) {
				const listOne = basePrice.mul(nights);
				const payOne = listOne; // no dynamic engine
				const listTotal = listOne.mul(item.count);
				const payTotal = payOne.mul(item.count);
				items.push({
					itemType: item.itemType,
					itemId: item.itemId,
					name,
					count: item.count,
					pricing: {
						listPrice: Number(listTotal.toFixed(2)),
						payablePrice: Number(payTotal.toFixed(2)),
						averagePricePerNight: Number(payTotal.dividedBy(nights).dividedBy(item.count).toFixed(2)),
						averageListPricePerNight: Number(listTotal.dividedBy(nights).dividedBy(item.count).toFixed(2)),
						discountApplied: false,
						holidayApplied: false,
						nightBreakdown: [],
					},
				});
				totalsListPrice = totalsListPrice.plus(listTotal);
				totalsPayablePrice = totalsPayablePrice.plus(payTotal);
				continue;
			}

			const breakdown: NightBreakdownEntry[] = [];
			let itemList = ZERO;
			let itemPay = ZERO;
			let itemHadDiscount = false;
			let itemHadHoliday = false;

			for (const ymd of nightYmds) {
				const mult = holidayMap.get(ymd) ?? ONE;
				const isHoliday = !mult.equals(ONE);
				if (isHoliday) itemHadHoliday = true;

				const { pay, flooredTo } = this.computeNight(basePrice, floorPrice, mult, baseDiscount);
				const list = basePrice;

				if (baseDiscount.greaterThan(ZERO)) itemHadDiscount = true;

				itemList = itemList.plus(list);
				itemPay = itemPay.plus(pay);

				breakdown.push({
					date: ymd,
					list: Number(list.toFixed(2)),
					pay: Number(pay.toFixed(2)),
					holidayMultiplier: Number(mult.toFixed(2)),
					discountRate: Number(baseDiscount.toFixed(4)),
					flooredTo: flooredTo ? Number(flooredTo.toFixed(2)) : null,
				});
			}

			const listForItem = itemList.mul(item.count);
			const payForItem = itemPay.mul(item.count);

			const pricing: QuoteItemPricing = {
				listPrice: Number(listForItem.toFixed(2)),
				payablePrice: Number(payForItem.toFixed(2)),
				averagePricePerNight: Number(payForItem.dividedBy(nights).dividedBy(item.count).toFixed(2)),
				averageListPricePerNight: Number(listForItem.dividedBy(nights).dividedBy(item.count).toFixed(2)),
				discountApplied: itemHadDiscount,
				holidayApplied: itemHadHoliday,
				nightBreakdown: breakdown,
			};

			items.push({
				itemType: item.itemType,
				itemId: item.itemId,
				name,
				count: item.count,
				pricing,
			});

			totalsListPrice = totalsListPrice.plus(listForItem);
			totalsPayablePrice = totalsPayablePrice.plus(payForItem);
			if (itemHadDiscount) anyDiscount = true;
			if (itemHadHoliday) anyHoliday = true;
		}

		const payload: Omit<QuoteResponse, "quoteHash"> = {
			currency: "VND",
			nights,
			items,
			totals: {
				listPrice: Number(totalsListPrice.toFixed(2)),
				payablePrice: Number(totalsPayablePrice.toFixed(2)),
				discountApplied: anyDiscount,
				holidayApplied: anyHoliday,
			},
		};

		return {
			...payload,
			quoteHash: hashQuote(payload),
		};
	}
}

export default PricingService;
