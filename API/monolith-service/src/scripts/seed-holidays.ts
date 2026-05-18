import "dotenv/config";
import prismaClient from "../clients/prisma.client";

type HolidaySeed = {
	name: string;
	date: string; // YYYY-MM-DD (year 2000 for recurring)
	isRecurring: boolean;
};

// Recurring Gregorian holidays — stored under year 2000, matched by MM-DD.
const RECURRING: HolidaySeed[] = [
	{ name: "Tết Dương Lịch", date: "2000-01-01", isRecurring: true },
	{ name: "Giỗ Tổ Hùng Vương (Gregorian fallback)", date: "2000-04-10", isRecurring: true },
	{ name: "Ngày Giải Phóng Miền Nam", date: "2000-04-30", isRecurring: true },
	{ name: "Quốc Tế Lao Động", date: "2000-05-01", isRecurring: true },
	{ name: "Quốc Khánh", date: "2000-09-02", isRecurring: true },
];

// Lunar New Year (Tết Âm Lịch) — Gregorian dates shift each year, store explicit rows.
// Source: Vietnamese public-holiday calendar 2026-2030. One row per holiday day.
const LUNAR_NEW_YEAR: HolidaySeed[] = [
	// 2026: Tết starts Feb 17 (Tue). Official off: Feb 16-20.
	{ name: "Tết Nguyên Đán 2026 (giao thừa)", date: "2026-02-16", isRecurring: false },
	{ name: "Tết Nguyên Đán 2026 (mùng 1)", date: "2026-02-17", isRecurring: false },
	{ name: "Tết Nguyên Đán 2026 (mùng 2)", date: "2026-02-18", isRecurring: false },
	{ name: "Tết Nguyên Đán 2026 (mùng 3)", date: "2026-02-19", isRecurring: false },
	{ name: "Tết Nguyên Đán 2026 (mùng 4)", date: "2026-02-20", isRecurring: false },

	// 2027: Tết starts Feb 6 (Sat).
	{ name: "Tết Nguyên Đán 2027 (giao thừa)", date: "2027-02-05", isRecurring: false },
	{ name: "Tết Nguyên Đán 2027 (mùng 1)", date: "2027-02-06", isRecurring: false },
	{ name: "Tết Nguyên Đán 2027 (mùng 2)", date: "2027-02-07", isRecurring: false },
	{ name: "Tết Nguyên Đán 2027 (mùng 3)", date: "2027-02-08", isRecurring: false },
	{ name: "Tết Nguyên Đán 2027 (mùng 4)", date: "2027-02-09", isRecurring: false },

	// 2028: Tết starts Jan 26 (Wed).
	{ name: "Tết Nguyên Đán 2028 (giao thừa)", date: "2028-01-25", isRecurring: false },
	{ name: "Tết Nguyên Đán 2028 (mùng 1)", date: "2028-01-26", isRecurring: false },
	{ name: "Tết Nguyên Đán 2028 (mùng 2)", date: "2028-01-27", isRecurring: false },
	{ name: "Tết Nguyên Đán 2028 (mùng 3)", date: "2028-01-28", isRecurring: false },
	{ name: "Tết Nguyên Đán 2028 (mùng 4)", date: "2028-01-29", isRecurring: false },

	// 2029: Tết starts Feb 13 (Tue).
	{ name: "Tết Nguyên Đán 2029 (giao thừa)", date: "2029-02-12", isRecurring: false },
	{ name: "Tết Nguyên Đán 2029 (mùng 1)", date: "2029-02-13", isRecurring: false },
	{ name: "Tết Nguyên Đán 2029 (mùng 2)", date: "2029-02-14", isRecurring: false },
	{ name: "Tết Nguyên Đán 2029 (mùng 3)", date: "2029-02-15", isRecurring: false },
	{ name: "Tết Nguyên Đán 2029 (mùng 4)", date: "2029-02-16", isRecurring: false },

	// 2030: Tết starts Feb 3 (Sun).
	{ name: "Tết Nguyên Đán 2030 (giao thừa)", date: "2030-02-02", isRecurring: false },
	{ name: "Tết Nguyên Đán 2030 (mùng 1)", date: "2030-02-03", isRecurring: false },
	{ name: "Tết Nguyên Đán 2030 (mùng 2)", date: "2030-02-04", isRecurring: false },
	{ name: "Tết Nguyên Đán 2030 (mùng 3)", date: "2030-02-05", isRecurring: false },
	{ name: "Tết Nguyên Đán 2030 (mùng 4)", date: "2030-02-06", isRecurring: false },
];

async function seedHolidays() {
	const all = [...RECURRING, ...LUNAR_NEW_YEAR];
	console.log(`Seeding ${all.length} holiday rows (${RECURRING.length} recurring, ${LUNAR_NEW_YEAR.length} explicit Lunar New Year)…`);

	let inserted = 0;
	let skipped = 0;

	for (const h of all) {
		try {
			await prismaClient.holiday.upsert({
				where: { date: new Date(h.date) },
				create: {
					name: h.name,
					date: new Date(h.date),
					isRecurring: h.isRecurring,
				},
				update: {
					name: h.name,
					isRecurring: h.isRecurring,
				},
			});
			inserted++;
		} catch (err) {
			console.error(`Failed seeding ${h.name} @ ${h.date}:`, err);
			skipped++;
		}
	}

	console.log(`Done. Upserted: ${inserted}, Skipped: ${skipped}.`);
}

seedHolidays()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(async () => {
		await prismaClient.$disconnect();
	});
