import "dotenv/config";
import prismaClient from "../clients/prisma.client";

type HolidaySeed = {
	name: string;
	code: string;
	date: string; // YYYY-MM-DD (year 2000 for recurring)
	isRecurring: boolean;
};

// Recurring Gregorian holidays — stored under year 2000, matched by MM-DD.
const RECURRING: HolidaySeed[] = [
	{ name: "Tết Dương Lịch", code: "NEW_YEAR", date: "2000-01-01", isRecurring: true },
	{ name: "Giỗ Tổ Hùng Vương", code: "HUNG_KINGS", date: "2000-04-10", isRecurring: true },
	{ name: "Ngày Giải Phóng Miền Nam", code: "LIBERATION", date: "2000-04-30", isRecurring: true },
	{ name: "Quốc Tế Lao Động", code: "LABOR_DAY", date: "2000-05-01", isRecurring: true },
	{ name: "Quốc Khánh", code: "NATIONAL_DAY", date: "2000-09-02", isRecurring: true },
];

// Lunar New Year (Tết Âm Lịch) — Seed only the ANCHOR date (Mùng 1).
// Windows (Pre/Post) are configured by the owner in the UI.
const LUNAR_NEW_YEAR: HolidaySeed[] = [
	{ name: "Tết Nguyên Đán 2026", code: "TET", date: "2026-02-17", isRecurring: false },
	{ name: "Tết Nguyên Đán 2027", code: "TET", date: "2027-02-06", isRecurring: false },
	{ name: "Tết Nguyên Đán 2028", code: "TET", date: "2028-01-26", isRecurring: false },
	{ name: "Tết Nguyên Đán 2029", code: "TET", date: "2029-02-13", isRecurring: false },
	{ name: "Tết Nguyên Đán 2030", code: "TET", date: "2030-02-03", isRecurring: false },
];

async function seedHolidays() {
	const all = [...RECURRING, ...LUNAR_NEW_YEAR];
	console.log(`Seeding ${all.length} holiday anchors…`);

	let inserted = 0;
	let skipped = 0;

	for (const h of all) {
		try {
			await prismaClient.holiday.upsert({
				where: { date_isRecurring: { date: new Date(h.date), isRecurring: h.isRecurring } },
				create: {
					name: h.name,
					code: h.code,
					date: new Date(h.date),
					isRecurring: h.isRecurring,
				},
				update: {
					name: h.name,
					code: h.code,
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
