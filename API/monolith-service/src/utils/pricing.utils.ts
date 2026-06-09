import crypto from "crypto";
import { Decimal } from "@/types/decimal";
import { BadRequestError } from "@/errors";
import { QuoteResponse } from "@/types/pricing.types";

const HCM_TZ = "Asia/Ho_Chi_Minh";
export const DAY_MS = 24 * 60 * 60 * 1000;

export function toHcmYmd(d: Date): string {
	// en-CA locale formats as YYYY-MM-DD
	const fmt = new Intl.DateTimeFormat("en-CA", {
		timeZone: HCM_TZ,
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
	});
	return fmt.format(d);
}

export function ymdToHcmMidnightUtc(ymd: string): Date {
	// HCM is UTC+7 (no DST). Midnight in HCM = 17:00 UTC the previous day.
	const [y, m, d] = ymd.split("-").map((n) => parseInt(n, 10));
	return new Date(Date.UTC(y, m - 1, d, -7, 0, 0));
}

export function diffDaysHcm(later: Date, earlier: Date): number {
	const a = ymdToHcmMidnightUtc(toHcmYmd(later));
	const b = ymdToHcmMidnightUtc(toHcmYmd(earlier));
	return Math.floor((a.getTime() - b.getTime()) / DAY_MS);
}

export function enumerateNights(checkIn: Date, checkOut: Date): string[] {
	const startYmd = toHcmYmd(checkIn);
	const endYmd = toHcmYmd(checkOut);
	if (startYmd >= endYmd) {
		throw new BadRequestError("checkOut must be after checkIn (HCM tz)");
	}
	const nights: string[] = [];
	let cursor = ymdToHcmMidnightUtc(startYmd);
	const end = ymdToHcmMidnightUtc(endYmd);
	while (cursor.getTime() < end.getTime()) {
		nights.push(toHcmYmd(cursor));
		cursor = new Date(cursor.getTime() + DAY_MS);
	}
	return nights;
}

export function ymdMmDd(ymd: string): string {
	return ymd.slice(5); // MM-DD
}

/**
 * @deprecated
 */
export function canonicalNumber(value: Decimal | number | string): string {
	return new Decimal(value).toFixed(2);
}

export function canonicalize(obj: unknown): string {
	if (obj === null || typeof obj !== "object") {
		return JSON.stringify(obj);
	}

	// Handle objects with toJSON method (Date, Prisma.Decimal, etc.)
	if (typeof (obj as any).toJSON === "function") {
		return JSON.stringify((obj as any).toJSON());
	}

	if (Array.isArray(obj)) {
		return "[" + obj.map((x) => canonicalize(x)).join(",") + "]";
	}

	const keys = Object.keys(obj as Record<string, unknown>).sort();
	return (
		"{" +
		keys
			.map((k) => JSON.stringify(k) + ":" + canonicalize((obj as Record<string, unknown>)[k]))
			.join(",") +
		"}"
	);
}

export function hashQuote(payload: Omit<QuoteResponse, "quoteHash">): string {
	return crypto.createHash("sha256").update(canonicalize(payload)).digest("hex");
}
