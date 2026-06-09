import { injectable } from "tsyringe";
import { BadRequestError } from "@/shared/error/BadRequestError";

const HCM_TZ = "Asia/Ho_Chi_Minh";
const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Night-enumeration calendar fixed to the Asia/Ho_Chi_Minh timezone (UTC+7, no
 * DST). All stay-window math goes through here so a quote is independent of the
 * server's timezone (spec §1.3). Pure — no I/O.
 */
@injectable()
export class NightCalendar {
	public readonly dayMs = DAY_MS;

	/** Calendar date (YYYY-MM-DD) of an instant, as seen in HCM. */
	public toHcmYmd(d: Date): string {
		// en-CA locale formats as YYYY-MM-DD.
		const fmt = new Intl.DateTimeFormat("en-CA", {
			timeZone: HCM_TZ,
			year: "numeric",
			month: "2-digit",
			day: "2-digit",
		});
		return fmt.format(d);
	}

	/** UTC instant of HCM midnight for a YYYY-MM-DD (HCM midnight = 17:00 UTC the day before). */
	public ymdToHcmMidnightUtc(ymd: string): Date {
		const [y, m, d] = ymd.split("-").map((n) => parseInt(n, 10));
		return new Date(Date.UTC(y, m - 1, d, -7, 0, 0));
	}

	/** Whole HCM-calendar days between two instants (later - earlier). */
	public diffDaysHcm(later: Date, earlier: Date): number {
		const a = this.ymdToHcmMidnightUtc(this.toHcmYmd(later));
		const b = this.ymdToHcmMidnightUtc(this.toHcmYmd(earlier));
		return Math.floor((a.getTime() - b.getTime()) / DAY_MS);
	}

	/** The list of night dates (YYYY-MM-DD) for a [checkIn, checkOut) stay. */
	public enumerateNights(checkIn: Date, checkOut: Date): string[] {
		const startYmd = this.toHcmYmd(checkIn);
		const endYmd = this.toHcmYmd(checkOut);
		if (startYmd >= endYmd) {
			throw new BadRequestError("checkOut must be after checkIn (HCM tz)");
		}
		const nights: string[] = [];
		let cursor = this.ymdToHcmMidnightUtc(startYmd);
		const end = this.ymdToHcmMidnightUtc(endYmd);
		while (cursor.getTime() < end.getTime()) {
			nights.push(this.toHcmYmd(cursor));
			cursor = new Date(cursor.getTime() + DAY_MS);
		}
		return nights;
	}

	/** The MM-DD part of a YYYY-MM-DD (used to match recurring holidays). */
	public ymdMmDd(ymd: string): string {
		return ymd.slice(5);
	}
}
